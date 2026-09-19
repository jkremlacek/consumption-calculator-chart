var ConsumptionCostChart=function(){"use strict";const k=`
  :host {
    display: block;
    width: 100%;
    height: 100%;
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
    border-radius: 16px;
    box-shadow: 0 10px 26px var(--shadow);
    padding: 12px 12px 8px;
    box-sizing: border-box;
    overflow: hidden;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 2px 2px 8px;
    gap: 8px;
  }

  .title {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: 0.01em;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px 12px;
    color: var(--text-secondary);
    font-size: 0.75rem;
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
    min-height: 260px;
    position: relative;
  }

  svg {
    display: block;
    width: 100%;
    height: 100%;
    min-height: 260px;
    overflow: visible;
    background: transparent;
  }

  .axis-label {
    fill: var(--text-secondary);
    font-size: 11px;
    font-weight: 500;
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
`;function v(n){if(n==null||n==="")return null;const t=Number.parseFloat(n);return Number.isFinite(t)?t:null}function D(n,t,a=9e5){const c=Date.now()-t*60*60*1e3,o=new Map;return(Array.isArray(n)?n:[]).forEach(r=>{(Array.isArray(r==null?void 0:r.states)?r.states:[]).forEach(s=>{const i=new Date(s.last_updated||s.last_changed||s.last_reported).getTime();if(!Number.isFinite(i)||i<c)return;const h=Math.floor(i/a)*a,u=v(s.state);if(u===null)return;const l=o.get(h);(!l||i>l.time)&&o.set(h,{time:i,value:u})})}),Array.from(o.entries()).sort(([r],[e])=>r-e).map(([r,e])=>({time:r,value:e.value}))}function F(n,t){return Number.isFinite(n)?n.toFixed(t):"—"}function E(n){if(!n.length)return[];const t=Math.max(1,Math.ceil(n.length/6));return n.filter((a,c)=>c%t===0||c===n.length-1)}const y={title:"Electricity Cost",hours:24,decimals:2,colors:["#4fc3f7","#f9a825","#ef5350"],entities:["sensor.current_15min_cost","sensor.current_shared_cost_15min","sensor.current_grid_cost_15min"]};class A extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._hass=null,this._chartData=[],this._config={...y},this._ready=!1,this._historyBlocked=!1}setConfig(t){const a={...y,...t||{},colors:(t==null?void 0:t.colors)||y.colors,entities:Array.isArray(t==null?void 0:t.entities)?t.entities:y.entities};a.entities.length||(a.entities=y.entities),this._config=a,this._ready=!0,this.requestUpdate()}set hass(t){this._hass=t,this.requestUpdate()}requestUpdate(){if(!this._ready||!this._hass){this.renderPlaceholder("Waiting for Home Assistant state…");return}this.refreshData()}async refreshData(){const{entities:t,hours:a}=this._config,c=new Date(Date.now()-a*60*60*1e3).toISOString(),o=new Date().toISOString();try{const r=await Promise.all(t.map(async(e,s)=>{var p;const i=await this.fetchHistoryForEntity(e,c,o),h=D(i,a),u=(p=this._hass.states[e])==null?void 0:p.state,l=v(u);return l!==null&&(!h.length||h[h.length-1].time<Date.now())&&h.push({time:Date.now(),value:l}),{entityId:e,label:e.split(".").pop().replace(/_/g," "),color:this._config.colors[s%this._config.colors.length],points:h.sort((x,f)=>x.time-f.time)}}));this._chartData=this.buildChartData(r),this.render()}catch(r){console.warn("CostChartCard history unavailable; using live state only.",r);const e=t.map((s,i)=>{var u;const h=v((u=this._hass.states[s])==null?void 0:u.state);return{entityId:s,label:s.split(".").pop().replace(/_/g," "),color:this._config.colors[i%this._config.colors.length],points:h!==null?[{time:Date.now(),value:h}]:[]}});this._chartData=this.buildChartData(e),this.render()}}async fetchHistoryForEntity(t,a,c){var e;if(this._historyBlocked)return[];const o={start_time:a,end_time:c,filter_entity_id:t,minimal_response:!0,significant_changes_only:!1};if((e=this._hass)!=null&&e.callApi&&typeof this._hass.callApi=="function")try{const s=await this._hass.callApi("GET","history/period",o);return Array.isArray(s)?s:[]}catch(s){console.warn(`callApi history request failed for ${t}; falling back to fetch`,s)}const r=new URLSearchParams;Object.entries(o).forEach(([s,i])=>{r.append(s,String(i))});try{const s=await fetch(`/api/history/period?${r.toString()}`);if(s.status===401||s.status===403)return this._historyBlocked=!0,console.warn(`History access denied for ${t}; using live state only.`),[];if(!s.ok)throw new Error(`History API returned ${s.status}`);const i=await s.json();return Array.isArray(i)?i:[]}catch(s){return this._historyBlocked=!0,console.warn(`History fetch unavailable for ${t}; using live state only.`,s),[]}}buildChartData(t){const a=new Set;t.forEach(l=>{l.points.forEach(p=>a.add(p.time))});const c=Array.from(a).sort((l,p)=>l-p),o=t.map(l=>{const p=new Map(l.points.map(f=>[f.time,f.value])),x=c.map(f=>({time:f,value:p.has(f)?p.get(f):null}));return{...l,points:x}}),r=o.flatMap(l=>l.points.map(p=>p.value)).filter(l=>Number.isFinite(l)),e=r.length?Math.min(...r):0,s=r.length?Math.max(...r):0,i=Math.max((s-e)*.15,.1),h=Math.max(0,e-i),u=s+i;return{series:o,times:c,yMin:h,yMax:u,yTicks:this.buildTicks(h,u,5),xTicks:E(c)}}buildTicks(t,a,c){if(!Number.isFinite(t)||!Number.isFinite(a)||a===t)return Array.from({length:3},(r,e)=>t+(a-t)/2*e);const o=(a-t)/(c-1);return Array.from({length:c},(r,e)=>t+o*e)}renderPlaceholder(t){this.shadowRoot.innerHTML=`
      <style>${k}</style>
      <div class="card">
        <div class="empty">${t}</div>
      </div>
    `}render(){var C,M;const t=this._chartData,{title:a,decimals:c}=this._config;if(!((C=t==null?void 0:t.series)!=null&&C.length)||!((M=t.times)!=null&&M.length)){this.renderPlaceholder("No chart data available for the selected time range.");return}const o=740,r=280,e={top:20,right:14,bottom:40,left:52},s=o-e.left-e.right,i=r-e.top-e.bottom,h=d=>{const m=Math.max(1,t.times.length-1);return e.left+d/m*s},u=d=>{const m=t.yMax-t.yMin||1;return e.top+i-(d-t.yMin)/m*i},l=Array.from({length:5},(d,m)=>{const b=e.left+m/4*s,_=t.xTicks[m]??t.xTicks[t.xTicks.length-1],g=_?new Date(_).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):"";return`<line class="grid-line" x1="${b}" y1="${e.top}" x2="${b}" y2="${e.top+i}" />
        <text class="axis-label" x="${b}" y="${r-14}" text-anchor="middle">${g}</text>`}).join(""),p=t.yTicks.map(d=>{const m=u(d);return`
        <line class="grid-line" x1="${e.left}" y1="${m}" x2="${o-e.right}" y2="${m}" />
        <text class="axis-label" x="${e.left-10}" y="${m+4}" text-anchor="end">${F(d,c)}</text>
      `}).join(""),x=t.series.map((d,m)=>{const b=d.points.reduce((g,$,w)=>{var T;if($.value===null)return g;const S=h(w),j=u($.value),H=w===0||((T=d.points[w-1])==null?void 0:T.value)===null?"M":"L";return`${g}${H}${S.toFixed(2)} ${j.toFixed(2)} `},"").trim(),_=d.points.filter(g=>g.value!==null).map(g=>{const $=h(d.points.indexOf(g)),w=u(g.value);return`<circle class="point" cx="${$}" cy="${w}" r="2.4" fill="${d.color}" />`}).join("");return`
        <path class="series-line" d="${b}" stroke="${d.color}" />
        ${_}
      `}).join(""),f=t.series.map(d=>`
      <span class="legend-item">
        <span class="legend-swatch" style="background: ${d.color};"></span>
        <span>${d.label}</span>
      </span>
    `).join("");this.shadowRoot.innerHTML=`
      <style>${k}</style>
      <div class="card">
        <div class="header">
          <h3 class="title">${a}</h3>
          <div class="legend">${f}</div>
        </div>
        <div class="chart-shell">
          <svg viewBox="0 0 ${o} ${r}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Electricity cost over time">
            <line class="axis-line" x1="${e.left}" y1="${e.top+i}" x2="${o-e.right}" y2="${e.top+i}" />
            <line class="axis-line" x1="${e.left}" y1="${e.top}" x2="${e.left}" y2="${e.top+i}" />
            ${l}
            ${p}
            ${x}
          </svg>
        </div>
      </div>
    `}}return customElements.get("cost-chart-card")||customElements.define("cost-chart-card",A),window.customCards=window.customCards||[],window.customCards.some(n=>n.type==="cost-chart-card")||window.customCards.push({type:"cost-chart-card",name:"Cost Chart Card",description:"2D line chart for electricity cost sensors"}),A}();
//# sourceMappingURL=cost-chart-card.js.map
