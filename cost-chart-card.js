var ConsumptionCostChart=function(){"use strict";const v=`
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
`;function k(n){if(n==null||n==="")return null;const t=Number.parseFloat(n);return Number.isFinite(t)?t:null}function D(n,t,r=9e5){const c=Date.now()-t*60*60*1e3,o=new Map;return(Array.isArray(n)?n:[]).forEach(s=>{(Array.isArray(s==null?void 0:s.states)?s.states:[]).forEach(d=>{const a=new Date(d.last_updated||d.last_changed||d.last_reported).getTime();if(!Number.isFinite(a)||a<c)return;const i=Math.floor(a/r)*r,p=k(d.state);if(p===null)return;const l=o.get(i);(!l||a>l.time)&&o.set(i,{time:a,value:p})})}),Array.from(o.entries()).sort(([s],[e])=>s-e).map(([s,e])=>({time:s,value:e.value}))}function F(n,t){return Number.isFinite(n)?n.toFixed(t):"—"}function E(n){if(!n.length)return[];const t=Math.max(1,Math.ceil(n.length/6));return n.filter((r,c)=>c%t===0||c===n.length-1)}const y={title:"Electricity Cost",hours:24,decimals:2,colors:["#4fc3f7","#f9a825","#ef5350"],entities:["sensor.current_15min_cost","sensor.current_shared_cost_15min","sensor.current_grid_cost_15min"]};class A extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._hass=null,this._chartData=[],this._config={...y},this._ready=!1}setConfig(t){const r={...y,...t||{},colors:(t==null?void 0:t.colors)||y.colors,entities:Array.isArray(t==null?void 0:t.entities)?t.entities:y.entities};r.entities.length||(r.entities=y.entities),this._config=r,this._ready=!0,this.requestUpdate()}set hass(t){this._hass=t,this.requestUpdate()}requestUpdate(){if(!this._ready||!this._hass){this.renderPlaceholder("Waiting for Home Assistant state…");return}this.refreshData()}async refreshData(){const{entities:t,hours:r}=this._config,c=new Date(Date.now()-r*60*60*1e3).toISOString(),o=new Date().toISOString();try{const s=await Promise.all(t.map(async(e,d)=>{var u;const a=await this.fetchHistoryForEntity(e,c,o),i=D(a,r),p=(u=this._hass.states[e])==null?void 0:u.state,l=k(p);return l!==null&&(!i.length||i[i.length-1].time<Date.now())&&i.push({time:Date.now(),value:l}),{entityId:e,label:e.split(".").pop().replace(/_/g," "),color:this._config.colors[d%this._config.colors.length],points:i.sort((x,f)=>x.time-f.time)}}));this._chartData=this.buildChartData(s),this.render()}catch(s){console.error("CostChartCard history fetch failed",s),this.renderPlaceholder("Unable to load chart history.")}}async fetchHistoryForEntity(t,r,c){var a;const o={start_time:r,end_time:c,filter_entity_id:t,minimal_response:!0,significant_changes_only:!1};if((a=this._hass)!=null&&a.callApi&&typeof this._hass.callApi=="function")try{const i=await this._hass.callApi("GET","history/period",o);return Array.isArray(i)?i:[]}catch(i){console.warn(`callApi history request failed for ${t}; falling back to fetch`,i)}const s=new URLSearchParams;Object.entries(o).forEach(([i,p])=>{s.append(i,String(p))});const e=await fetch(`/api/history/period?${s.toString()}`);if(!e.ok)throw new Error(`History API returned ${e.status}`);const d=await e.json();return Array.isArray(d)?d:[]}buildChartData(t){const r=new Set;t.forEach(l=>{l.points.forEach(u=>r.add(u.time))});const c=Array.from(r).sort((l,u)=>l-u),o=t.map(l=>{const u=new Map(l.points.map(f=>[f.time,f.value])),x=c.map(f=>({time:f,value:u.has(f)?u.get(f):null}));return{...l,points:x}}),s=o.flatMap(l=>l.points.map(u=>u.value)).filter(l=>Number.isFinite(l)),e=s.length?Math.min(...s):0,d=s.length?Math.max(...s):0,a=Math.max((d-e)*.15,.1),i=Math.max(0,e-a),p=d+a;return{series:o,times:c,yMin:i,yMax:p,yTicks:this.buildTicks(i,p,5),xTicks:E(c)}}buildTicks(t,r,c){if(!Number.isFinite(t)||!Number.isFinite(r)||r===t)return Array.from({length:3},(s,e)=>t+(r-t)/2*e);const o=(r-t)/(c-1);return Array.from({length:c},(s,e)=>t+o*e)}renderPlaceholder(t){this.shadowRoot.innerHTML=`
      <style>${v}</style>
      <div class="card">
        <div class="empty">${t}</div>
      </div>
    `}render(){var M,C;const t=this._chartData,{title:r,decimals:c}=this._config;if(!((M=t==null?void 0:t.series)!=null&&M.length)||!((C=t.times)!=null&&C.length)){this.renderPlaceholder("No chart data available for the selected time range.");return}const o=740,s=280,e={top:20,right:14,bottom:40,left:52},d=o-e.left-e.right,a=s-e.top-e.bottom,i=h=>{const m=Math.max(1,t.times.length-1);return e.left+h/m*d},p=h=>{const m=t.yMax-t.yMin||1;return e.top+a-(h-t.yMin)/m*a},l=Array.from({length:5},(h,m)=>{const b=e.left+m/4*d,$=t.xTicks[m]??t.xTicks[t.xTicks.length-1],g=$?new Date($).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):"";return`<line class="grid-line" x1="${b}" y1="${e.top}" x2="${b}" y2="${e.top+a}" />
        <text class="axis-label" x="${b}" y="${s-14}" text-anchor="middle">${g}</text>`}).join(""),u=t.yTicks.map(h=>{const m=p(h);return`
        <line class="grid-line" x1="${e.left}" y1="${m}" x2="${o-e.right}" y2="${m}" />
        <text class="axis-label" x="${e.left-10}" y="${m+4}" text-anchor="end">${F(h,c)}</text>
      `}).join(""),x=t.series.map((h,m)=>{const b=h.points.reduce((g,_,w)=>{var T;if(_.value===null)return g;const S=i(w),j=p(_.value),N=w===0||((T=h.points[w-1])==null?void 0:T.value)===null?"M":"L";return`${g}${N}${S.toFixed(2)} ${j.toFixed(2)} `},"").trim(),$=h.points.filter(g=>g.value!==null).map(g=>{const _=i(h.points.indexOf(g)),w=p(g.value);return`<circle class="point" cx="${_}" cy="${w}" r="2.4" fill="${h.color}" />`}).join("");return`
        <path class="series-line" d="${b}" stroke="${h.color}" />
        ${$}
      `}).join(""),f=t.series.map(h=>`
      <span class="legend-item">
        <span class="legend-swatch" style="background: ${h.color};"></span>
        <span>${h.label}</span>
      </span>
    `).join("");this.shadowRoot.innerHTML=`
      <style>${v}</style>
      <div class="card">
        <div class="header">
          <h3 class="title">${r}</h3>
          <div class="legend">${f}</div>
        </div>
        <div class="chart-shell">
          <svg viewBox="0 0 ${o} ${s}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Electricity cost over time">
            <line class="axis-line" x1="${e.left}" y1="${e.top+a}" x2="${o-e.right}" y2="${e.top+a}" />
            <line class="axis-line" x1="${e.left}" y1="${e.top}" x2="${e.left}" y2="${e.top+a}" />
            ${l}
            ${u}
            ${x}
          </svg>
        </div>
      </div>
    `}}return customElements.get("cost-chart-card")||customElements.define("cost-chart-card",A),window.customCards=window.customCards||[],window.customCards.some(n=>n.type==="cost-chart-card")||window.customCards.push({type:"cost-chart-card",name:"Cost Chart Card",description:"2D line chart for electricity cost sensors"}),A}();
//# sourceMappingURL=cost-chart-card.js.map
