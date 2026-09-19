var ConsumptionCostChart=function(){"use strict";const _=`
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
`;function k(i){if(i==null||i==="")return null;const t=Number.parseFloat(i);return Number.isFinite(t)?t:null}function D(i,t,r=9e5){const o=Date.now()-t*60*60*1e3,a=new Map;return(Array.isArray(i)?i:[]).forEach(s=>{(Array.isArray(s==null?void 0:s.states)?s.states:[]).forEach(p=>{const l=new Date(p.last_updated||p.last_changed||p.last_reported).getTime();if(!Number.isFinite(l)||l<o)return;const h=Math.floor(l/r)*r,u=k(p.state);if(u===null)return;const n=a.get(h);(!n||l>n.time)&&a.set(h,{time:l,value:u})})}),Array.from(a.entries()).sort(([s],[e])=>s-e).map(([s,e])=>({time:s,value:e.value}))}function F(i,t){return Number.isFinite(i)?i.toFixed(t):"—"}function E(i){if(!i.length)return[];const t=Math.max(1,Math.ceil(i.length/6));return i.filter((r,o)=>o%t===0||o===i.length-1)}const x={title:"Electricity Cost",hours:24,decimals:2,colors:["#4fc3f7","#f9a825","#ef5350"],entities:["sensor.current_15min_cost","sensor.current_shared_cost_15min","sensor.current_grid_cost_15min"]};class M extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._hass=null,this._chartData=[],this._config={...x},this._ready=!1}setConfig(t){const r={...x,...t||{},colors:(t==null?void 0:t.colors)||x.colors,entities:Array.isArray(t==null?void 0:t.entities)?t.entities:x.entities};r.entities.length||(r.entities=x.entities),this._config=r,this._ready=!0,this.requestUpdate()}set hass(t){this._hass=t,this.requestUpdate()}requestUpdate(){if(!this._ready||!this._hass){this.renderPlaceholder("Waiting for Home Assistant state…");return}this.refreshData()}async refreshData(){const{entities:t,hours:r}=this._config,o=new Date(Date.now()-r*60*60*1e3).toISOString(),a=new Date().toISOString();try{const s=await Promise.all(t.map(async(e,p)=>{var d;const l=await this.fetchHistoryForEntity(e,o,a),h=D(l,r),u=(d=this._hass.states[e])==null?void 0:d.state,n=k(u);return n!==null&&(!h.length||h[h.length-1].time<Date.now())&&h.push({time:Date.now(),value:n}),{entityId:e,label:e.split(".").pop().replace(/_/g," "),color:this._config.colors[p%this._config.colors.length],points:h.sort((y,g)=>y.time-g.time)}}));this._chartData=this.buildChartData(s),this.render()}catch(s){console.error("CostChartCard history fetch failed",s),this.renderPlaceholder("Unable to load chart history.")}}async fetchHistoryForEntity(t,r,o){var s;if(!((s=this._hass)!=null&&s.callApi))return[];const a=await this._hass.callApi("GET","history/period",{start_time:r,end_time:o,filter_entity_id:t,minimal_response:!0,significant_changes_only:!1});return Array.isArray(a)?a:[]}buildChartData(t){const r=new Set;t.forEach(n=>{n.points.forEach(d=>r.add(d.time))});const o=Array.from(r).sort((n,d)=>n-d),a=t.map(n=>{const d=new Map(n.points.map(g=>[g.time,g.value])),y=o.map(g=>({time:g,value:d.has(g)?d.get(g):null}));return{...n,points:y}}),s=a.flatMap(n=>n.points.map(d=>d.value)).filter(n=>Number.isFinite(n)),e=s.length?Math.min(...s):0,p=s.length?Math.max(...s):0,l=Math.max((p-e)*.15,.1),h=Math.max(0,e-l),u=p+l;return{series:a,times:o,yMin:h,yMax:u,yTicks:this.buildTicks(h,u,5),xTicks:E(o)}}buildTicks(t,r,o){if(!Number.isFinite(t)||!Number.isFinite(r)||r===t)return Array.from({length:3},(s,e)=>t+(r-t)/2*e);const a=(r-t)/(o-1);return Array.from({length:o},(s,e)=>t+a*e)}renderPlaceholder(t){this.shadowRoot.innerHTML=`
      <style>${_}</style>
      <div class="card">
        <div class="empty">${t}</div>
      </div>
    `}render(){var C,T;const t=this._chartData,{title:r,decimals:o}=this._config;if(!((C=t==null?void 0:t.series)!=null&&C.length)||!((T=t.times)!=null&&T.length)){this.renderPlaceholder("No chart data available for the selected time range.");return}const a=740,s=280,e={top:20,right:14,bottom:40,left:52},p=a-e.left-e.right,l=s-e.top-e.bottom,h=c=>{const m=Math.max(1,t.times.length-1);return e.left+c/m*p},u=c=>{const m=t.yMax-t.yMin||1;return e.top+l-(c-t.yMin)/m*l},n=Array.from({length:5},(c,m)=>{const b=e.left+m/4*p,$=t.xTicks[m]??t.xTicks[t.xTicks.length-1],f=$?new Date($).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):"";return`<line class="grid-line" x1="${b}" y1="${e.top}" x2="${b}" y2="${e.top+l}" />
        <text class="axis-label" x="${b}" y="${s-14}" text-anchor="middle">${f}</text>`}).join(""),d=t.yTicks.map(c=>{const m=u(c);return`
        <line class="grid-line" x1="${e.left}" y1="${m}" x2="${a-e.right}" y2="${m}" />
        <text class="axis-label" x="${e.left-10}" y="${m+4}" text-anchor="end">${F(c,o)}</text>
      `}).join(""),y=t.series.map((c,m)=>{const b=c.points.reduce((f,v,w)=>{var A;if(v.value===null)return f;const N=h(w),S=u(v.value),j=w===0||((A=c.points[w-1])==null?void 0:A.value)===null?"M":"L";return`${f}${j}${N.toFixed(2)} ${S.toFixed(2)} `},"").trim(),$=c.points.filter(f=>f.value!==null).map(f=>{const v=h(c.points.indexOf(f)),w=u(f.value);return`<circle class="point" cx="${v}" cy="${w}" r="2.4" fill="${c.color}" />`}).join("");return`
        <path class="series-line" d="${b}" stroke="${c.color}" />
        ${$}
      `}).join(""),g=t.series.map(c=>`
      <span class="legend-item">
        <span class="legend-swatch" style="background: ${c.color};"></span>
        <span>${c.label}</span>
      </span>
    `).join("");this.shadowRoot.innerHTML=`
      <style>${_}</style>
      <div class="card">
        <div class="header">
          <h3 class="title">${r}</h3>
          <div class="legend">${g}</div>
        </div>
        <div class="chart-shell">
          <svg viewBox="0 0 ${a} ${s}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Electricity cost over time">
            <line class="axis-line" x1="${e.left}" y1="${e.top+l}" x2="${a-e.right}" y2="${e.top+l}" />
            <line class="axis-line" x1="${e.left}" y1="${e.top}" x2="${e.left}" y2="${e.top+l}" />
            ${n}
            ${d}
            ${y}
          </svg>
        </div>
      </div>
    `}}return customElements.get("cost-chart-card")||customElements.define("cost-chart-card",M),window.customCards=window.customCards||[],window.customCards.some(i=>i.type==="cost-chart-card")||window.customCards.push({type:"cost-chart-card",name:"Cost Chart Card",description:"2D line chart for electricity cost sensors"}),M}();
//# sourceMappingURL=cost-chart-card.js.map
