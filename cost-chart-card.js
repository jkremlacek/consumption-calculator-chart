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
`;function $(a){if(a==null||a==="")return null;const t=Number.parseFloat(a);return Number.isFinite(t)?t:null}function F(a,t,r=9e5){const c=Date.now()-t*60*60*1e3,i=new Map,o=e=>{Array.isArray(e)&&e.forEach(s=>{if(Array.isArray(s)){o(s);return}if(!s||typeof s!="object")return;(Array.isArray(s.states)?s.states:[s]).forEach(p=>{if(!p||typeof p!="object")return;const h=new Date(p.last_updated||p.last_changed||p.last_reported||p.time).getTime();if(!Number.isFinite(h)||h<c)return;const l=$(p.state??p.value);if(l===null)return;const u=Math.floor(h/r)*r,n=i.get(u);(!n||h>n.time)&&i.set(u,{time:h,value:l})})})};return o(a),Array.from(i.entries()).sort(([e],[s])=>e-s).map(([e,s])=>({time:e,value:s.value}))}function E(a,t){return Number.isFinite(a)?a.toFixed(t):"—"}function L(a){if(!a.length)return[];if(a.length===1)return[a[0]-36e5,a[0]];const t=Math.min(5,Math.max(2,a.length)),r=[];for(let i=0;i<t;i+=1){const o=Math.round(i/(t-1)*(a.length-1));r.push(a[o])}const c=[...new Set(r)];return c.length>1?c:[a[0],a[a.length-1]]}const A="1.0.5",_={title:"Electricity Cost",hours:24,decimals:2,colors:["#4fc3f7","#f9a825","#ef5350"],entities:["sensor.current_15min_cost","sensor.current_shared_cost_15min","sensor.current_grid_cost_15min"]};class S extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._hass=null,this._chartData=[],this._config={..._},this._ready=!1,this._historyBlocked=!1}setConfig(t){const r={..._,...t||{},colors:(t==null?void 0:t.colors)||_.colors,entities:Array.isArray(t==null?void 0:t.entities)?t.entities:_.entities};r.entities.length||(r.entities=_.entities),this._config=r,this._ready=!0,this.requestUpdate()}set hass(t){this._hass=t,this.requestUpdate()}requestUpdate(){if(!this._ready||!this._hass){this.renderPlaceholder("Waiting for Home Assistant state…");return}if(this._historyBlocked){this.renderLiveOnlyState();return}this.refreshData()}buildLiveSeries(){return this._config.entities.map((t,r)=>{var i;const c=$((i=this._hass.states[t])==null?void 0:i.state);return{entityId:t,label:t.split(".").pop().replace(/_/g," "),color:this._config.colors[r%this._config.colors.length],points:c!==null?[{time:Date.now(),value:c}]:[]}}).filter(t=>t.points.length)}async refreshData(){const{entities:t,hours:r}=this._config,c=new Date(Date.now()-r*60*60*1e3).toISOString(),i=new Date().toISOString();try{const o=await Promise.all(t.map(async(s,f)=>{var n;const p=await this.fetchHistoryForEntity(s,c,i),h=F(p,r),l=(n=this._hass.states[s])==null?void 0:n.state,u=$(l);return u!==null&&(!h.length||h[h.length-1].time<Date.now())&&h.push({time:Date.now(),value:u}),{entityId:s,label:s.split(".").pop().replace(/_/g," "),color:this._config.colors[f%this._config.colors.length],points:h.sort((g,M)=>g.time-M.time)}})),e=o.some(s=>s.points.length>0);this._chartData=this.buildChartData(e?o:this.buildLiveSeries()),this.render()}catch(o){console.warn("CostChartCard history unavailable; using live state only.",o),this._historyBlocked=!0,this.renderLiveOnlyState()}}async fetchHistoryForEntity(t,r,c){var s,f,p,h,l,u;if(this._historyBlocked)return[];const i={start_time:r,end_time:c,filter_entity_id:t,minimal_response:!0,significant_changes_only:!1};if((s=this._hass)!=null&&s.callApi&&typeof this._hass.callApi=="function")try{const n=await this._hass.callApi("GET","history/period",i);return Array.isArray(n)?n:[]}catch(n){console.warn(`callApi history request failed for ${t}; falling back to fetch`,n)}const o=new URLSearchParams;Object.entries(i).forEach(([n,g])=>{o.append(n,String(g))});const e=((h=(p=(f=this._hass)==null?void 0:f.auth)==null?void 0:p.data)==null?void 0:h.access_token)||((u=(l=this._hass)==null?void 0:l.auth)==null?void 0:u.access_token);try{const n=await fetch(`/api/history/period?${o.toString()}`,{headers:{...e?{Authorization:`Bearer ${e}`}:{}}});if(n.status===401||n.status===403)return this._historyBlocked=!0,console.warn(`History access denied for ${t}; using live state only.`),[];if(!n.ok)throw new Error(`History API returned ${n.status}`);const g=await n.json();return Array.isArray(g)?g:[]}catch(n){return this._historyBlocked=!0,console.warn(`History fetch unavailable for ${t}; using live state only.`,n),[]}}buildChartData(t){const r=new Set;t.forEach(l=>{l.points.forEach(u=>r.add(u.time))});const c=Array.from(r).sort((l,u)=>l-u),i=t.map(l=>{const u=new Map(l.points.map(g=>[g.time,g.value])),n=c.map(g=>({time:g,value:u.has(g)?u.get(g):null}));return{...l,points:n}}),o=i.flatMap(l=>l.points.map(u=>u.value)).filter(l=>Number.isFinite(l)),e=o.length?Math.min(...o):0,s=o.length?Math.max(...o):0,f=Math.max((s-e)*.15,.1),p=Math.max(0,e-f),h=s+f;return{series:i,times:c,yMin:p,yMax:h,yTicks:this.buildTicks(p,h,5),xTicks:L(c)}}buildTicks(t,r,c){if(!Number.isFinite(t)||!Number.isFinite(r)||r===t)return Array.from({length:3},(o,e)=>t+(r-t)/2*e);const i=(r-t)/(c-1);return Array.from({length:c},(o,e)=>t+i*e)}renderPlaceholder(t){this.shadowRoot.innerHTML=`
      <style>${k}</style>
      <div class="card">
        <div class="empty">${t}<br /><small>v${A}</small></div>
      </div>
    `}renderLiveOnlyState(){const t=this.buildLiveSeries();this._chartData=this.buildChartData(t),this.render(),t.length||this.renderPlaceholder(`History access blocked — live data unavailable. v${A}`)}render(){var C,D;const t=this._chartData,{title:r,decimals:c}=this._config;if(!((C=t==null?void 0:t.series)!=null&&C.length)||!((D=t.times)!=null&&D.length)){this.renderPlaceholder("No chart data available for the selected time range.");return}const i=740,o=220,e={top:10,right:14,bottom:28,left:46},s=i-e.left-e.right,f=o-e.top-e.bottom,p=t.times.length===1&&t.series.length>1,h=(d,m)=>{if(p){const b=Math.min(s*.28,90),y=(d-(t.series.length-1)/2)/Math.max(1,t.series.length-1)*b;return e.left+s*.82+y}const x=Math.max(1,t.times.length-1);return e.left+m/x*s},l=d=>{const m=t.yMax-t.yMin||1;return e.top+f-(d-t.yMin)/m*f},u=Array.from({length:5},(d,m)=>{const x=e.left+m/4*s,b=t.xTicks[m]??t.xTicks[t.xTicks.length-1],y=b?new Date(b).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):"";return`<line class="grid-line" x1="${x}" y1="${e.top}" x2="${x}" y2="${e.top+f}" />
        <text class="axis-label" x="${x}" y="${o-14}" text-anchor="middle">${y}</text>`}).join(""),n=t.yTicks.map(d=>{const m=l(d);return`
        <line class="grid-line" x1="${e.left}" y1="${m}" x2="${i-e.right}" y2="${m}" />
        <text class="axis-label" x="${e.left-10}" y="${m+4}" text-anchor="end">${E(d,c)}</text>
      `}).join(""),g=t.series.map((d,m)=>{const x=d.points.reduce((y,w,v)=>{var T;if(w.value===null)return y;const j=h(m,v),N=l(w.value),O=v===0||((T=d.points[v-1])==null?void 0:T.value)===null?"M":"L";return`${y}${O}${j.toFixed(2)} ${N.toFixed(2)} `},"").trim(),b=d.points.filter(y=>y.value!==null).map(y=>{const w=h(m,d.points.indexOf(y)),v=l(y.value);return`<circle class="point" cx="${w}" cy="${v}" r="2.4" fill="${d.color}" />`}).join("");return`
        <path class="series-line" d="${x}" stroke="${d.color}" />
        ${b}
      `}).join(""),H=this._config.entities.map((d,m)=>{var b;const x=t.series.find(y=>y.entityId===d);return{label:d.split(".").pop().replace(/_/g," "),color:this._config.colors[m%this._config.colors.length],hasData:(b=x==null?void 0:x.points)==null?void 0:b.some(y=>Number.isFinite(y.value))}}).map(d=>`
      <span class="legend-item">
        <span class="legend-swatch" style="background: ${d.color};"></span>
        <span>${d.label}</span>
      </span>
    `).join("");this.shadowRoot.innerHTML=`
      <style>${k}</style>
      <div class="card">
        <h3 class="title">${r}</h3>
        <div class="chart-shell">
          <svg viewBox="0 0 ${i} ${o}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Electricity cost over time">
            <line class="axis-line" x1="${e.left}" y1="${e.top+f}" x2="${i-e.right}" y2="${e.top+f}" />
            <line class="axis-line" x1="${e.left}" y1="${e.top}" x2="${e.left}" y2="${e.top+f}" />
            ${u}
            ${n}
            ${g}
          </svg>
        </div>
        <div class="legend">${H}</div>
      </div>
    `}}return customElements.get("cost-chart-card")||customElements.define("cost-chart-card",S),window.customCards=window.customCards||[],window.customCards.some(a=>a.type==="cost-chart-card")||window.customCards.push({type:"cost-chart-card",name:"Cost Chart Card",description:"2D line chart for electricity cost sensors"}),S}();
//# sourceMappingURL=cost-chart-card.js.map
