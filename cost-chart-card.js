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
`;function v(o){if(o==null||o==="")return null;const t=Number.parseFloat(o);return Number.isFinite(t)?t:null}function D(o,t,i=9e5){const h=Date.now()-t*60*60*1e3,l=new Map;return(Array.isArray(o)?o:[]).forEach(s=>{(Array.isArray(s==null?void 0:s.states)?s.states:[]).forEach(n=>{const a=new Date(n.last_updated||n.last_changed||n.last_reported).getTime();if(!Number.isFinite(a)||a<h)return;const r=Math.floor(a/i)*i,u=v(n.state);if(u===null)return;const c=l.get(r);(!c||a>c.time)&&l.set(r,{time:a,value:u})})}),Array.from(l.entries()).sort(([s],[e])=>s-e).map(([s,e])=>({time:s,value:e.value}))}function F(o,t){return Number.isFinite(o)?o.toFixed(t):"—"}function E(o){if(!o.length)return[];const t=Math.max(1,Math.ceil(o.length/6));return o.filter((i,h)=>h%t===0||h===o.length-1)}const x={title:"Electricity Cost",hours:24,decimals:2,colors:["#4fc3f7","#f9a825","#ef5350"],entities:["sensor.current_15min_cost","sensor.current_shared_cost_15min","sensor.current_grid_cost_15min"]};class A extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._hass=null,this._chartData=[],this._config={...x},this._ready=!1}setConfig(t){const i={...x,...t||{},colors:(t==null?void 0:t.colors)||x.colors,entities:Array.isArray(t==null?void 0:t.entities)?t.entities:x.entities};i.entities.length||(i.entities=x.entities),this._config=i,this._ready=!0,this.requestUpdate()}set hass(t){this._hass=t,this.requestUpdate()}requestUpdate(){if(!this._ready||!this._hass){this.renderPlaceholder("Waiting for Home Assistant state…");return}this.refreshData()}async refreshData(){const{entities:t,hours:i}=this._config,h=new Date(Date.now()-i*60*60*1e3).toISOString(),l=new Date().toISOString();try{const s=await Promise.all(t.map(async(e,n)=>{var p;const a=await this.fetchHistoryForEntity(e,h,l),r=D(a,i),u=(p=this._hass.states[e])==null?void 0:p.state,c=v(u);return c!==null&&(!r.length||r[r.length-1].time<Date.now())&&r.push({time:Date.now(),value:c}),{entityId:e,label:e.split(".").pop().replace(/_/g," "),color:this._config.colors[n%this._config.colors.length],points:r.sort((y,f)=>y.time-f.time)}}));this._chartData=this.buildChartData(s),this.render()}catch(s){console.warn("CostChartCard history unavailable; using live state only.",s);const e=t.map((n,a)=>{var u;const r=v((u=this._hass.states[n])==null?void 0:u.state);return{entityId:n,label:n.split(".").pop().replace(/_/g," "),color:this._config.colors[a%this._config.colors.length],points:r!==null?[{time:Date.now(),value:r}]:[]}});this._chartData=this.buildChartData(e),this.render()}}async fetchHistoryForEntity(t,i,h){var a;const l={start_time:i,end_time:h,filter_entity_id:t,minimal_response:!0,significant_changes_only:!1};if((a=this._hass)!=null&&a.callApi&&typeof this._hass.callApi=="function")try{const r=await this._hass.callApi("GET","history/period",l);return Array.isArray(r)?r:[]}catch(r){console.warn(`callApi history request failed for ${t}; falling back to fetch`,r)}const s=new URLSearchParams;Object.entries(l).forEach(([r,u])=>{s.append(r,String(u))});const e=await fetch(`/api/history/period?${s.toString()}`);if(e.status===401||e.status===403)return console.warn(`History access denied for ${t}; using live state only.`),[];if(!e.ok)throw new Error(`History API returned ${e.status}`);const n=await e.json();return Array.isArray(n)?n:[]}buildChartData(t){const i=new Set;t.forEach(c=>{c.points.forEach(p=>i.add(p.time))});const h=Array.from(i).sort((c,p)=>c-p),l=t.map(c=>{const p=new Map(c.points.map(f=>[f.time,f.value])),y=h.map(f=>({time:f,value:p.has(f)?p.get(f):null}));return{...c,points:y}}),s=l.flatMap(c=>c.points.map(p=>p.value)).filter(c=>Number.isFinite(c)),e=s.length?Math.min(...s):0,n=s.length?Math.max(...s):0,a=Math.max((n-e)*.15,.1),r=Math.max(0,e-a),u=n+a;return{series:l,times:h,yMin:r,yMax:u,yTicks:this.buildTicks(r,u,5),xTicks:E(h)}}buildTicks(t,i,h){if(!Number.isFinite(t)||!Number.isFinite(i)||i===t)return Array.from({length:3},(s,e)=>t+(i-t)/2*e);const l=(i-t)/(h-1);return Array.from({length:h},(s,e)=>t+l*e)}renderPlaceholder(t){this.shadowRoot.innerHTML=`
      <style>${k}</style>
      <div class="card">
        <div class="empty">${t}</div>
      </div>
    `}render(){var C,M;const t=this._chartData,{title:i,decimals:h}=this._config;if(!((C=t==null?void 0:t.series)!=null&&C.length)||!((M=t.times)!=null&&M.length)){this.renderPlaceholder("No chart data available for the selected time range.");return}const l=740,s=280,e={top:20,right:14,bottom:40,left:52},n=l-e.left-e.right,a=s-e.top-e.bottom,r=d=>{const m=Math.max(1,t.times.length-1);return e.left+d/m*n},u=d=>{const m=t.yMax-t.yMin||1;return e.top+a-(d-t.yMin)/m*a},c=Array.from({length:5},(d,m)=>{const b=e.left+m/4*n,_=t.xTicks[m]??t.xTicks[t.xTicks.length-1],g=_?new Date(_).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):"";return`<line class="grid-line" x1="${b}" y1="${e.top}" x2="${b}" y2="${e.top+a}" />
        <text class="axis-label" x="${b}" y="${s-14}" text-anchor="middle">${g}</text>`}).join(""),p=t.yTicks.map(d=>{const m=u(d);return`
        <line class="grid-line" x1="${e.left}" y1="${m}" x2="${l-e.right}" y2="${m}" />
        <text class="axis-label" x="${e.left-10}" y="${m+4}" text-anchor="end">${F(d,h)}</text>
      `}).join(""),y=t.series.map((d,m)=>{const b=d.points.reduce((g,$,w)=>{var T;if($.value===null)return g;const S=r(w),j=u($.value),H=w===0||((T=d.points[w-1])==null?void 0:T.value)===null?"M":"L";return`${g}${H}${S.toFixed(2)} ${j.toFixed(2)} `},"").trim(),_=d.points.filter(g=>g.value!==null).map(g=>{const $=r(d.points.indexOf(g)),w=u(g.value);return`<circle class="point" cx="${$}" cy="${w}" r="2.4" fill="${d.color}" />`}).join("");return`
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
          <h3 class="title">${i}</h3>
          <div class="legend">${f}</div>
        </div>
        <div class="chart-shell">
          <svg viewBox="0 0 ${l} ${s}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Electricity cost over time">
            <line class="axis-line" x1="${e.left}" y1="${e.top+a}" x2="${l-e.right}" y2="${e.top+a}" />
            <line class="axis-line" x1="${e.left}" y1="${e.top}" x2="${e.left}" y2="${e.top+a}" />
            ${c}
            ${p}
            ${y}
          </svg>
        </div>
      </div>
    `}}return customElements.get("cost-chart-card")||customElements.define("cost-chart-card",A),window.customCards=window.customCards||[],window.customCards.some(o=>o.type==="cost-chart-card")||window.customCards.push({type:"cost-chart-card",name:"Cost Chart Card",description:"2D line chart for electricity cost sensors"}),A}();
//# sourceMappingURL=cost-chart-card.js.map
