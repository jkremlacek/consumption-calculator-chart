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
    border-radius: 12px;
    box-shadow: 0 10px 26px var(--shadow);
    padding: 10px 10px 6px;
    box-sizing: border-box;
    overflow: hidden;
  }

  .title {
    font-size: 1rem;
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
    font-size: 0.72rem;
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
`;function $(l){if(l==null||l==="")return null;const t=Number.parseFloat(l);return Number.isFinite(t)?t:null}function S(l,t,i=9e5){const a=Date.now()-t*60*60*1e3,o=new Map;return(Array.isArray(l)?l:[]).forEach(s=>{(Array.isArray(s==null?void 0:s.states)?s.states:[]).forEach(r=>{const n=new Date(r.last_updated||r.last_changed||r.last_reported).getTime();if(!Number.isFinite(n)||n<a)return;const d=Math.floor(n/i)*i,p=$(r.state);if(p===null)return;const c=o.get(d);(!c||n>c.time)&&o.set(d,{time:n,value:p})})}),Array.from(o.entries()).sort(([s],[e])=>s-e).map(([s,e])=>({time:s,value:e.value}))}function E(l,t){return Number.isFinite(l)?l.toFixed(t):"—"}function F(l){if(!l.length)return[];const t=Math.max(1,Math.ceil(l.length/6));return l.filter((i,a)=>a%t===0||a===l.length-1)}const A="1.0.0",y={title:"Electricity Cost",hours:24,decimals:2,colors:["#4fc3f7","#f9a825","#ef5350"],entities:["sensor.current_15min_cost","sensor.current_shared_cost_15min","sensor.current_grid_cost_15min"]};class C extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._hass=null,this._chartData=[],this._config={...y},this._ready=!1,this._historyBlocked=!1}setConfig(t){const i={...y,...t||{},colors:(t==null?void 0:t.colors)||y.colors,entities:Array.isArray(t==null?void 0:t.entities)?t.entities:y.entities};i.entities.length||(i.entities=y.entities),this._config=i,this._ready=!0,this.requestUpdate()}set hass(t){this._hass=t,this.requestUpdate()}requestUpdate(){if(!this._ready||!this._hass){this.renderPlaceholder("Waiting for Home Assistant state…");return}if(this._historyBlocked){this.renderLiveOnlyState();return}this.refreshData()}async refreshData(){const{entities:t,hours:i}=this._config,a=new Date(Date.now()-i*60*60*1e3).toISOString(),o=new Date().toISOString();try{const s=await Promise.all(t.map(async(e,r)=>{var u;const n=await this.fetchHistoryForEntity(e,a,o),d=S(n,i),p=(u=this._hass.states[e])==null?void 0:u.state,c=$(p);return c!==null&&(!d.length||d[d.length-1].time<Date.now())&&d.push({time:Date.now(),value:c}),{entityId:e,label:e.split(".").pop().replace(/_/g," "),color:this._config.colors[r%this._config.colors.length],points:d.sort((x,f)=>x.time-f.time)}}));this._chartData=this.buildChartData(s),this.render()}catch(s){console.warn("CostChartCard history unavailable; using live state only.",s),this._historyBlocked=!0,this.renderLiveOnlyState()}}async fetchHistoryForEntity(t,i,a){var e;if(this._historyBlocked)return[];const o={start_time:i,end_time:a,filter_entity_id:t,minimal_response:!0,significant_changes_only:!1};if((e=this._hass)!=null&&e.callApi&&typeof this._hass.callApi=="function")try{const r=await this._hass.callApi("GET","history/period",o);return Array.isArray(r)?r:[]}catch(r){console.warn(`callApi history request failed for ${t}; falling back to fetch`,r)}const s=new URLSearchParams;Object.entries(o).forEach(([r,n])=>{s.append(r,String(n))});try{const r=await fetch(`/api/history/period?${s.toString()}`);if(r.status===401||r.status===403)return this._historyBlocked=!0,console.warn(`History access denied for ${t}; using live state only.`),[];if(!r.ok)throw new Error(`History API returned ${r.status}`);const n=await r.json();return Array.isArray(n)?n:[]}catch(r){return this._historyBlocked=!0,console.warn(`History fetch unavailable for ${t}; using live state only.`,r),[]}}buildChartData(t){const i=new Set;t.forEach(c=>{c.points.forEach(u=>i.add(u.time))});const a=Array.from(i).sort((c,u)=>c-u),o=t.map(c=>{const u=new Map(c.points.map(f=>[f.time,f.value])),x=a.map(f=>({time:f,value:u.has(f)?u.get(f):null}));return{...c,points:x}}),s=o.flatMap(c=>c.points.map(u=>u.value)).filter(c=>Number.isFinite(c)),e=s.length?Math.min(...s):0,r=s.length?Math.max(...s):0,n=Math.max((r-e)*.15,.1),d=Math.max(0,e-n),p=r+n;return{series:o,times:a,yMin:d,yMax:p,yTicks:this.buildTicks(d,p,5),xTicks:F(a)}}buildTicks(t,i,a){if(!Number.isFinite(t)||!Number.isFinite(i)||i===t)return Array.from({length:3},(s,e)=>t+(i-t)/2*e);const o=(i-t)/(a-1);return Array.from({length:a},(s,e)=>t+o*e)}renderPlaceholder(t){this.shadowRoot.innerHTML=`
      <style>${k}</style>
      <div class="card">
        <div class="empty">${t}<br /><small>v${A}</small></div>
      </div>
    `}renderLiveOnlyState(){const{title:t}=this._config,i=this._config.entities.map((a,o)=>{var e;const s=$((e=this._hass.states[a])==null?void 0:e.state);return{entityId:a,label:a.split(".").pop().replace(/_/g," "),color:this._config.colors[o%this._config.colors.length],points:s!==null?[{time:Date.now(),value:s}]:[]}}).filter(a=>a.points.length);this._chartData=this.buildChartData(i),this.render(),i.length||this.renderPlaceholder(`History access blocked — live data unavailable. v${A}`)}render(){var M,D;const t=this._chartData,{title:i,decimals:a}=this._config;if(!((M=t==null?void 0:t.series)!=null&&M.length)||!((D=t.times)!=null&&D.length)){this.renderPlaceholder("No chart data available for the selected time range.");return}const o=740,s=220,e={top:10,right:14,bottom:28,left:46},r=o-e.left-e.right,n=s-e.top-e.bottom,d=h=>{const m=Math.max(1,t.times.length-1);return e.left+h/m*r},p=h=>{const m=t.yMax-t.yMin||1;return e.top+n-(h-t.yMin)/m*n},c=Array.from({length:5},(h,m)=>{const b=e.left+m/4*r,w=t.xTicks[m]??t.xTicks[t.xTicks.length-1],g=w?new Date(w).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):"";return`<line class="grid-line" x1="${b}" y1="${e.top}" x2="${b}" y2="${e.top+n}" />
        <text class="axis-label" x="${b}" y="${s-14}" text-anchor="middle">${g}</text>`}).join(""),u=t.yTicks.map(h=>{const m=p(h);return`
        <line class="grid-line" x1="${e.left}" y1="${m}" x2="${o-e.right}" y2="${m}" />
        <text class="axis-label" x="${e.left-10}" y="${m+4}" text-anchor="end">${E(h,a)}</text>
      `}).join(""),x=t.series.map((h,m)=>{const b=h.points.reduce((g,v,_)=>{var T;if(v.value===null)return g;const H=d(_),L=p(v.value),N=_===0||((T=h.points[_-1])==null?void 0:T.value)===null?"M":"L";return`${g}${N}${H.toFixed(2)} ${L.toFixed(2)} `},"").trim(),w=h.points.filter(g=>g.value!==null).map(g=>{const v=d(h.points.indexOf(g)),_=p(g.value);return`<circle class="point" cx="${v}" cy="${_}" r="2.4" fill="${h.color}" />`}).join("");return`
        <path class="series-line" d="${b}" stroke="${h.color}" />
        ${w}
      `}).join(""),f=t.series.map(h=>`
      <span class="legend-item">
        <span class="legend-swatch" style="background: ${h.color};"></span>
        <span>${h.label}</span>
      </span>
    `).join("");this.shadowRoot.innerHTML=`
      <style>${k}</style>
      <div class="card">
        <h3 class="title">${i}</h3>
        <div class="chart-shell">
          <svg viewBox="0 0 ${o} ${s}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Electricity cost over time">
            <line class="axis-line" x1="${e.left}" y1="${e.top+n}" x2="${o-e.right}" y2="${e.top+n}" />
            <line class="axis-line" x1="${e.left}" y1="${e.top}" x2="${e.left}" y2="${e.top+n}" />
            ${c}
            ${u}
            ${x}
          </svg>
        </div>
        <div class="legend">${f}</div>
      </div>
    `}}return customElements.get("cost-chart-card")||customElements.define("cost-chart-card",C),window.customCards=window.customCards||[],window.customCards.some(l=>l.type==="cost-chart-card")||window.customCards.push({type:"cost-chart-card",name:"Cost Chart Card",description:"2D line chart for electricity cost sensors"}),C}();
//# sourceMappingURL=cost-chart-card.js.map
