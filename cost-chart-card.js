var ConsumptionCostChart=function(){"use strict";const A=`
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
`;function $(n){if(n==null||n==="")return null;const t=Number.parseFloat(n);return Number.isFinite(t)?t:null}function F(n,t,r=9e5){const c=Date.now()-t*60*60*1e3,i=new Map,o=e=>{Array.isArray(e)&&e.forEach(s=>{if(Array.isArray(s)){o(s);return}if(!s||typeof s!="object")return;(Array.isArray(s.states)?s.states:[s]).forEach(u=>{if(!u||typeof u!="object")return;const l=new Date(u.last_updated||u.last_changed||u.last_reported||u.time).getTime();if(!Number.isFinite(l)||l<c)return;const h=$(u.state??u.value);if(h===null)return;const p=Math.floor(l/r)*r,a=i.get(p);(!a||l>a.time)&&i.set(p,{time:l,value:h})})})};return o(n),Array.from(i.entries()).sort(([e],[s])=>e-s).map(([e,s])=>({time:e,value:s.value}))}function E(n,t){return Number.isFinite(n)?n.toFixed(t):"—"}function L(n){if(!n.length)return[];if(n.length===1)return[n[0]-36e5,n[0]];const t=Math.min(5,Math.max(2,n.length)),r=[];for(let i=0;i<t;i+=1){const o=Math.round(i/(t-1)*(n.length-1));r.push(n[o])}const c=[...new Set(r)];return c.length>1?c:[n[0],n[n.length-1]]}const S="1.0.4",_={title:"Electricity Cost",hours:24,decimals:2,colors:["#4fc3f7","#f9a825","#ef5350"],entities:["sensor.current_15min_cost","sensor.current_shared_cost_15min","sensor.current_grid_cost_15min"]};class C extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._hass=null,this._chartData=[],this._config={..._},this._ready=!1,this._historyBlocked=!1}setConfig(t){const r={..._,...t||{},colors:(t==null?void 0:t.colors)||_.colors,entities:Array.isArray(t==null?void 0:t.entities)?t.entities:_.entities};r.entities.length||(r.entities=_.entities),this._config=r,this._ready=!0,this.requestUpdate()}set hass(t){this._hass=t,this.requestUpdate()}requestUpdate(){if(!this._ready||!this._hass){this.renderPlaceholder("Waiting for Home Assistant state…");return}if(this._historyBlocked){this.renderLiveOnlyState();return}this.refreshData()}buildLiveSeries(){return this._config.entities.map((t,r)=>{var i;const c=$((i=this._hass.states[t])==null?void 0:i.state);return{entityId:t,label:t.split(".").pop().replace(/_/g," "),color:this._config.colors[r%this._config.colors.length],points:c!==null?[{time:Date.now(),value:c}]:[]}}).filter(t=>t.points.length)}async refreshData(){const{entities:t,hours:r}=this._config,c=new Date(Date.now()-r*60*60*1e3).toISOString(),i=new Date().toISOString();try{const o=await Promise.all(t.map(async(s,f)=>{var a;const u=await this.fetchHistoryForEntity(s,c,i),l=F(u,r),h=(a=this._hass.states[s])==null?void 0:a.state,p=$(h);return p!==null&&(!l.length||l[l.length-1].time<Date.now())&&l.push({time:Date.now(),value:p}),{entityId:s,label:s.split(".").pop().replace(/_/g," "),color:this._config.colors[f%this._config.colors.length],points:l.sort((g,k)=>g.time-k.time)}})),e=o.some(s=>s.points.length>0);this._chartData=this.buildChartData(e?o:this.buildLiveSeries()),this.render()}catch(o){console.warn("CostChartCard history unavailable; using live state only.",o),this._historyBlocked=!0,this.renderLiveOnlyState()}}async fetchHistoryForEntity(t,r,c){var s,f,u,l,h,p;if(this._historyBlocked)return[];const i={start_time:r,end_time:c,filter_entity_id:t,minimal_response:!0,significant_changes_only:!1};if((s=this._hass)!=null&&s.callApi&&typeof this._hass.callApi=="function")try{const a=await this._hass.callApi("GET","history/period",i);return Array.isArray(a)?a:[]}catch(a){console.warn(`callApi history request failed for ${t}; falling back to fetch`,a)}const o=new URLSearchParams;Object.entries(i).forEach(([a,g])=>{o.append(a,String(g))});const e=((l=(u=(f=this._hass)==null?void 0:f.auth)==null?void 0:u.data)==null?void 0:l.access_token)||((p=(h=this._hass)==null?void 0:h.auth)==null?void 0:p.access_token);try{const a=await fetch(`/api/history/period?${o.toString()}`,{headers:{...e?{Authorization:`Bearer ${e}`}:{}}});if(a.status===401||a.status===403)return this._historyBlocked=!0,console.warn(`History access denied for ${t}; using live state only.`),[];if(!a.ok)throw new Error(`History API returned ${a.status}`);const g=await a.json();return Array.isArray(g)?g:[]}catch(a){return this._historyBlocked=!0,console.warn(`History fetch unavailable for ${t}; using live state only.`,a),[]}}buildChartData(t){const r=new Set;t.forEach(h=>{h.points.forEach(p=>r.add(p.time))});const c=Array.from(r).sort((h,p)=>h-p),i=t.map(h=>{const p=new Map(h.points.map(g=>[g.time,g.value])),a=c.map(g=>({time:g,value:p.has(g)?p.get(g):null}));return{...h,points:a}}),o=i.flatMap(h=>h.points.map(p=>p.value)).filter(h=>Number.isFinite(h)),e=o.length?Math.min(...o):0,s=o.length?Math.max(...o):0,f=Math.max((s-e)*.15,.1),u=Math.max(0,e-f),l=s+f;return{series:i,times:c,yMin:u,yMax:l,yTicks:this.buildTicks(u,l,5),xTicks:L(c)}}buildTicks(t,r,c){if(!Number.isFinite(t)||!Number.isFinite(r)||r===t)return Array.from({length:3},(o,e)=>t+(r-t)/2*e);const i=(r-t)/(c-1);return Array.from({length:c},(o,e)=>t+i*e)}renderPlaceholder(t){this.shadowRoot.innerHTML=`
      <style>${A}</style>
      <div class="card">
        <div class="empty">${t}<br /><small>v${S}</small></div>
      </div>
    `}renderLiveOnlyState(){const t=this.buildLiveSeries();this._chartData=this.buildChartData(t),this.render(),t.length||this.renderPlaceholder(`History access blocked — live data unavailable. v${S}`)}render(){var M,D;const t=this._chartData,{title:r,decimals:c}=this._config;if(!((M=t==null?void 0:t.series)!=null&&M.length)||!((D=t.times)!=null&&D.length)){this.renderPlaceholder("No chart data available for the selected time range.");return}const i=740,o=220,e={top:10,right:14,bottom:28,left:46},s=i-e.left-e.right,f=o-e.top-e.bottom,u=d=>{const m=Math.max(1,t.times.length-1);return e.left+d/m*s},l=d=>{const m=t.yMax-t.yMin||1;return e.top+f-(d-t.yMin)/m*f},h=Array.from({length:5},(d,m)=>{const x=e.left+m/4*s,b=t.xTicks[m]??t.xTicks[t.xTicks.length-1],y=b?new Date(b).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):"";return`<line class="grid-line" x1="${x}" y1="${e.top}" x2="${x}" y2="${e.top+f}" />
        <text class="axis-label" x="${x}" y="${o-14}" text-anchor="middle">${y}</text>`}).join(""),p=t.yTicks.map(d=>{const m=l(d);return`
        <line class="grid-line" x1="${e.left}" y1="${m}" x2="${i-e.right}" y2="${m}" />
        <text class="axis-label" x="${e.left-10}" y="${m+4}" text-anchor="end">${E(d,c)}</text>
      `}).join(""),a=t.series.map((d,m)=>{const x=d.points.reduce((y,w,v)=>{var T;if(w.value===null)return y;const H=u(v),j=l(w.value),N=v===0||((T=d.points[v-1])==null?void 0:T.value)===null?"M":"L";return`${y}${N}${H.toFixed(2)} ${j.toFixed(2)} `},"").trim(),b=d.points.filter(y=>y.value!==null).map(y=>{const w=u(d.points.indexOf(y)),v=l(y.value);return`<circle class="point" cx="${w}" cy="${v}" r="2.4" fill="${d.color}" />`}).join("");return`
        <path class="series-line" d="${x}" stroke="${d.color}" />
        ${b}
      `}).join(""),k=this._config.entities.map((d,m)=>{var b;const x=t.series.find(y=>y.entityId===d);return{label:d.split(".").pop().replace(/_/g," "),color:this._config.colors[m%this._config.colors.length],hasData:(b=x==null?void 0:x.points)==null?void 0:b.some(y=>Number.isFinite(y.value))}}).map(d=>`
      <span class="legend-item">
        <span class="legend-swatch" style="background: ${d.color};"></span>
        <span>${d.label}</span>
      </span>
    `).join("");this.shadowRoot.innerHTML=`
      <style>${A}</style>
      <div class="card">
        <h3 class="title">${r}</h3>
        <div class="chart-shell">
          <svg viewBox="0 0 ${i} ${o}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Electricity cost over time">
            <line class="axis-line" x1="${e.left}" y1="${e.top+f}" x2="${i-e.right}" y2="${e.top+f}" />
            <line class="axis-line" x1="${e.left}" y1="${e.top}" x2="${e.left}" y2="${e.top+f}" />
            ${h}
            ${p}
            ${a}
          </svg>
        </div>
        <div class="legend">${k}</div>
      </div>
    `}}return customElements.get("cost-chart-card")||customElements.define("cost-chart-card",C),window.customCards=window.customCards||[],window.customCards.some(n=>n.type==="cost-chart-card")||window.customCards.push({type:"cost-chart-card",name:"Cost Chart Card",description:"2D line chart for electricity cost sensors"}),C}();
//# sourceMappingURL=cost-chart-card.js.map
