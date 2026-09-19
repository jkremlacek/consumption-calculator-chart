var ConsumptionCostChart=function(){"use strict";const k=`
  :host {
    display: block;
    width: 100%;
    height: 100%;
    font-family: var(--ha-card-header-font-family, var(--primary-font-family));
    font-size: 14px;
    line-height: 1.4;
    --card-bg: rgba(20, 24, 36, 0.82);
    --card-border: rgba(255, 255, 255, 0.08);
    --text-primary: #ebf2ff;
    --text-secondary: rgba(235, 242, 255, 0.7);
    --grid: rgba(255, 255, 255, 0.12);
    --axis: rgba(255, 255, 255, 0.2);
    --shadow: rgba(0, 0, 0, 0.18);
  }

  .card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 12px;
    box-shadow: 0 10px 26px var(--shadow);
    padding: 10px 10px 6px;
    box-sizing: border-box;
    overflow: hidden;
  }

  .title {
    font-size: 1.18rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 6px;
    letter-spacing: 0.01em;
    line-height: 1.2;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 8px 12px;
    color: var(--text-secondary);
    font-size: 0.82rem;
    margin-top: 2px;
    padding-bottom: 2px;
  }

  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .legend-swatch {
    width: 12px;
    height: 3px;
    border-radius: 999px;
    display: inline-block;
  }

  .chart-shell {
    width: 100%;
    min-height: 180px;
    height: 220px;
    position: relative;
  }

  svg {
    display: block;
    width: 100%;
    height: 100%;
    min-height: 180px;
    overflow: visible;
    background: transparent;
  }

  .axis-label {
    fill: var(--text-secondary);
    font-size: 12px;
    font-weight: 500;
    font-family: inherit;
  }

  .grid-line {
    stroke: var(--grid);
    stroke-width: 1;
    stroke-dasharray: 3 4;
  }

  .axis-line {
    stroke: var(--axis);
    stroke-width: 1;
  }

  .series-line {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2.5;
  }

  .point {
    stroke: rgba(17, 24, 39, 0.7);
    stroke-width: 1.5;
  }

  .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 180px;
    color: var(--text-secondary);
    font-size: 0.85rem;
  }
`;function $(a){if(a==null||a==="")return null;const t=Number.parseFloat(a);return Number.isFinite(t)?t:null}function T(a,t,s=9e5){const n=Date.now()-t*60*60*1e3,i=new Map,r=e=>{Array.isArray(e)&&e.forEach(c=>{if(Array.isArray(c)){r(c);return}if(!c||typeof c!="object")return;(Array.isArray(c.states)?c.states:[c]).forEach(o=>{if(!o||typeof o!="object")return;const p=new Date(o.last_updated||o.last_changed||o.last_reported||o.time).getTime();if(!Number.isFinite(p)||p<n)return;const h=$(o.state??o.value);if(h===null)return;const u=Math.floor(p/s)*s,l=i.get(u);(!l||p>l.time)&&i.set(u,{time:p,value:h})})})};return r(a),Array.from(i.entries()).sort(([e],[c])=>e-c).map(([e,c])=>({time:e,value:c.value}))}function F(a,t){return Number.isFinite(a)?a.toFixed(t):"—"}function E(a){if(!a.length)return[];if(a.length===1)return[a[0]-36e5,a[0]];const t=Math.min(5,Math.max(2,a.length)),s=[];for(let i=0;i<t;i+=1){const r=Math.round(i/(t-1)*(a.length-1));s.push(a[r])}const n=[...new Set(s)];return n.length>1?n:[a[0],a[a.length-1]]}const A="1.0.3",_={title:"Electricity Cost",hours:24,decimals:2,colors:["#4fc3f7","#f9a825","#ef5350"],entities:["sensor.current_15min_cost","sensor.current_shared_cost_15min","sensor.current_grid_cost_15min"]};class C extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._hass=null,this._chartData=[],this._config={..._},this._ready=!1,this._historyBlocked=!1}setConfig(t){const s={..._,...t||{},colors:(t==null?void 0:t.colors)||_.colors,entities:Array.isArray(t==null?void 0:t.entities)?t.entities:_.entities};s.entities.length||(s.entities=_.entities),this._config=s,this._ready=!0,this.requestUpdate()}set hass(t){this._hass=t,this.requestUpdate()}requestUpdate(){if(!this._ready||!this._hass){this.renderPlaceholder("Waiting for Home Assistant state…");return}if(this._historyBlocked){this.renderLiveOnlyState();return}this.refreshData()}async refreshData(){const{entities:t,hours:s}=this._config,n=new Date(Date.now()-s*60*60*1e3).toISOString(),i=new Date().toISOString();try{const r=await Promise.all(t.map(async(e,c)=>{var u;const f=await this.fetchHistoryForEntity(e,n,i),o=T(f,s),p=(u=this._hass.states[e])==null?void 0:u.state,h=$(p);return h!==null&&(!o.length||o[o.length-1].time<Date.now())&&o.push({time:Date.now(),value:h}),{entityId:e,label:e.split(".").pop().replace(/_/g," "),color:this._config.colors[c%this._config.colors.length],points:o.sort((l,g)=>l.time-g.time)}}));this._chartData=this.buildChartData(r),this.render()}catch(r){console.warn("CostChartCard history unavailable; using live state only.",r),this._historyBlocked=!0,this.renderLiveOnlyState()}}async fetchHistoryForEntity(t,s,n){var c,f,o,p,h,u;if(this._historyBlocked)return[];const i={start_time:s,end_time:n,filter_entity_id:t,minimal_response:!0,significant_changes_only:!1};if((c=this._hass)!=null&&c.callApi&&typeof this._hass.callApi=="function")try{const l=await this._hass.callApi("GET","history/period",i);return Array.isArray(l)?l:[]}catch(l){console.warn(`callApi history request failed for ${t}; falling back to fetch`,l)}const r=new URLSearchParams;Object.entries(i).forEach(([l,g])=>{r.append(l,String(g))});const e=((p=(o=(f=this._hass)==null?void 0:f.auth)==null?void 0:o.data)==null?void 0:p.access_token)||((u=(h=this._hass)==null?void 0:h.auth)==null?void 0:u.access_token);try{const l=await fetch(`/api/history/period?${r.toString()}`,{headers:{...e?{Authorization:`Bearer ${e}`}:{}}});if(l.status===401||l.status===403)return this._historyBlocked=!0,console.warn(`History access denied for ${t}; using live state only.`),[];if(!l.ok)throw new Error(`History API returned ${l.status}`);const g=await l.json();return Array.isArray(g)?g:[]}catch(l){return this._historyBlocked=!0,console.warn(`History fetch unavailable for ${t}; using live state only.`,l),[]}}buildChartData(t){const s=new Set;t.forEach(h=>{h.points.forEach(u=>s.add(u.time))});const n=Array.from(s).sort((h,u)=>h-u),i=t.map(h=>{const u=new Map(h.points.map(g=>[g.time,g.value])),l=n.map(g=>({time:g,value:u.has(g)?u.get(g):null}));return{...h,points:l}}),r=i.flatMap(h=>h.points.map(u=>u.value)).filter(h=>Number.isFinite(h)),e=r.length?Math.min(...r):0,c=r.length?Math.max(...r):0,f=Math.max((c-e)*.15,.1),o=Math.max(0,e-f),p=c+f;return{series:i,times:n,yMin:o,yMax:p,yTicks:this.buildTicks(o,p,5),xTicks:E(n)}}buildTicks(t,s,n){if(!Number.isFinite(t)||!Number.isFinite(s)||s===t)return Array.from({length:3},(r,e)=>t+(s-t)/2*e);const i=(s-t)/(n-1);return Array.from({length:n},(r,e)=>t+i*e)}renderPlaceholder(t){this.shadowRoot.innerHTML=`
      <style>${k}</style>
      <div class="card">
        <div class="empty">${t}<br /><small>v${A}</small></div>
      </div>
    `}renderLiveOnlyState(){const{title:t}=this._config,s=this._config.entities.map((n,i)=>{var e;const r=$((e=this._hass.states[n])==null?void 0:e.state);return{entityId:n,label:n.split(".").pop().replace(/_/g," "),color:this._config.colors[i%this._config.colors.length],points:r!==null?[{time:Date.now(),value:r}]:[]}}).filter(n=>n.points.length);this._chartData=this.buildChartData(s),this.render(),s.length||this.renderPlaceholder(`History access blocked — live data unavailable. v${A}`)}render(){var M,D;const t=this._chartData,{title:s,decimals:n}=this._config;if(!((M=t==null?void 0:t.series)!=null&&M.length)||!((D=t.times)!=null&&D.length)){this.renderPlaceholder("No chart data available for the selected time range.");return}const i=740,r=220,e={top:10,right:14,bottom:28,left:46},c=i-e.left-e.right,f=r-e.top-e.bottom,o=d=>{const m=Math.max(1,t.times.length-1);return e.left+d/m*c},p=d=>{const m=t.yMax-t.yMin||1;return e.top+f-(d-t.yMin)/m*f},h=Array.from({length:5},(d,m)=>{const x=e.left+m/4*c,b=t.xTicks[m]??t.xTicks[t.xTicks.length-1],y=b?new Date(b).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):"";return`<line class="grid-line" x1="${x}" y1="${e.top}" x2="${x}" y2="${e.top+f}" />
        <text class="axis-label" x="${x}" y="${r-14}" text-anchor="middle">${y}</text>`}).join(""),u=t.yTicks.map(d=>{const m=p(d);return`
        <line class="grid-line" x1="${e.left}" y1="${m}" x2="${i-e.right}" y2="${m}" />
        <text class="axis-label" x="${e.left-10}" y="${m+4}" text-anchor="end">${F(d,n)}</text>
      `}).join(""),l=t.series.map((d,m)=>{const x=d.points.reduce((y,w,v)=>{var S;if(w.value===null)return y;const H=o(v),N=p(w.value),L=v===0||((S=d.points[v-1])==null?void 0:S.value)===null?"M":"L";return`${y}${L}${H.toFixed(2)} ${N.toFixed(2)} `},"").trim(),b=d.points.filter(y=>y.value!==null).map(y=>{const w=o(d.points.indexOf(y)),v=p(y.value);return`<circle class="point" cx="${w}" cy="${v}" r="2.4" fill="${d.color}" />`}).join("");return`
        <path class="series-line" d="${x}" stroke="${d.color}" />
        ${b}
      `}).join(""),j=this._config.entities.map((d,m)=>{var b;const x=t.series.find(y=>y.entityId===d);return{label:d.split(".").pop().replace(/_/g," "),color:this._config.colors[m%this._config.colors.length],hasData:(b=x==null?void 0:x.points)==null?void 0:b.some(y=>Number.isFinite(y.value))}}).map(d=>`
      <span class="legend-item">
        <span class="legend-swatch" style="background: ${d.color};"></span>
        <span>${d.label}</span>
      </span>
    `).join("");this.shadowRoot.innerHTML=`
      <style>${k}</style>
      <div class="card">
        <h3 class="title">${s}</h3>
        <div class="chart-shell">
          <svg viewBox="0 0 ${i} ${r}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Electricity cost over time">
            <line class="axis-line" x1="${e.left}" y1="${e.top+f}" x2="${i-e.right}" y2="${e.top+f}" />
            <line class="axis-line" x1="${e.left}" y1="${e.top}" x2="${e.left}" y2="${e.top+f}" />
            ${h}
            ${u}
            ${l}
          </svg>
        </div>
        <div class="legend">${j}</div>
      </div>
    `}}return customElements.get("cost-chart-card")||customElements.define("cost-chart-card",C),window.customCards=window.customCards||[],window.customCards.some(a=>a.type==="cost-chart-card")||window.customCards.push({type:"cost-chart-card",name:"Cost Chart Card",description:"2D line chart for electricity cost sensors"}),C}();
//# sourceMappingURL=cost-chart-card.js.map
