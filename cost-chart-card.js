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
`;function $(a){if(a==null||a==="")return null;const t=Number.parseFloat(a);return Number.isFinite(t)?t:null}function T(a,t,r=9e5){const o=Date.now()-t*60*60*1e3,n=new Map;return(Array.isArray(a)?a:[]).forEach(s=>{(Array.isArray(s==null?void 0:s.states)?s.states:[]).forEach(i=>{const l=new Date(i.last_updated||i.last_changed||i.last_reported).getTime();if(!Number.isFinite(l)||l<o)return;const d=Math.floor(l/r)*r,f=$(i.state);if(f===null)return;const h=n.get(d);(!h||l>h.time)&&n.set(d,{time:l,value:f})})}),Array.from(n.entries()).sort(([s],[e])=>s-e).map(([s,e])=>({time:s,value:e.value}))}function F(a,t){return Number.isFinite(a)?a.toFixed(t):"—"}function E(a){if(!a.length)return[];if(a.length===1)return[a[0]-36e5,a[0]];const t=Math.min(5,Math.max(2,a.length)),r=[];for(let n=0;n<t;n+=1){const s=Math.round(n/(t-1)*(a.length-1));r.push(a[s])}const o=[...new Set(r)];return o.length>1?o:[a[0],a[a.length-1]]}const A="1.0.1",y={title:"Electricity Cost",hours:24,decimals:2,colors:["#4fc3f7","#f9a825","#ef5350"],entities:["sensor.current_15min_cost","sensor.current_shared_cost_15min","sensor.current_grid_cost_15min"]};class C extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._hass=null,this._chartData=[],this._config={...y},this._ready=!1,this._historyBlocked=!1}setConfig(t){const r={...y,...t||{},colors:(t==null?void 0:t.colors)||y.colors,entities:Array.isArray(t==null?void 0:t.entities)?t.entities:y.entities};r.entities.length||(r.entities=y.entities),this._config=r,this._ready=!0,this.requestUpdate()}set hass(t){this._hass=t,this.requestUpdate()}requestUpdate(){if(!this._ready||!this._hass){this.renderPlaceholder("Waiting for Home Assistant state…");return}if(this._historyBlocked){this.renderLiveOnlyState();return}this.refreshData()}async refreshData(){const{entities:t,hours:r}=this._config,o=new Date(Date.now()-r*60*60*1e3).toISOString(),n=new Date().toISOString();try{const s=await Promise.all(t.map(async(e,i)=>{var u;const l=await this.fetchHistoryForEntity(e,o,n),d=T(l,r),f=(u=this._hass.states[e])==null?void 0:u.state,h=$(f);return h!==null&&(!d.length||d[d.length-1].time<Date.now())&&d.push({time:Date.now(),value:h}),{entityId:e,label:e.split(".").pop().replace(/_/g," "),color:this._config.colors[i%this._config.colors.length],points:d.sort((x,g)=>x.time-g.time)}}));this._chartData=this.buildChartData(s),this.render()}catch(s){console.warn("CostChartCard history unavailable; using live state only.",s),this._historyBlocked=!0,this.renderLiveOnlyState()}}async fetchHistoryForEntity(t,r,o){var e;if(this._historyBlocked)return[];const n={start_time:r,end_time:o,filter_entity_id:t,minimal_response:!0,significant_changes_only:!1};if((e=this._hass)!=null&&e.callApi&&typeof this._hass.callApi=="function")try{const i=await this._hass.callApi("GET","history/period",n);return Array.isArray(i)?i:[]}catch(i){console.warn(`callApi history request failed for ${t}; falling back to fetch`,i)}const s=new URLSearchParams;Object.entries(n).forEach(([i,l])=>{s.append(i,String(l))});try{const i=await fetch(`/api/history/period?${s.toString()}`);if(i.status===401||i.status===403)return this._historyBlocked=!0,console.warn(`History access denied for ${t}; using live state only.`),[];if(!i.ok)throw new Error(`History API returned ${i.status}`);const l=await i.json();return Array.isArray(l)?l:[]}catch(i){return this._historyBlocked=!0,console.warn(`History fetch unavailable for ${t}; using live state only.`,i),[]}}buildChartData(t){const r=new Set;t.forEach(h=>{h.points.forEach(u=>r.add(u.time))});const o=Array.from(r).sort((h,u)=>h-u),n=t.map(h=>{const u=new Map(h.points.map(g=>[g.time,g.value])),x=o.map(g=>({time:g,value:u.has(g)?u.get(g):null}));return{...h,points:x}}),s=n.flatMap(h=>h.points.map(u=>u.value)).filter(h=>Number.isFinite(h)),e=s.length?Math.min(...s):0,i=s.length?Math.max(...s):0,l=Math.max((i-e)*.15,.1),d=Math.max(0,e-l),f=i+l;return{series:n,times:o,yMin:d,yMax:f,yTicks:this.buildTicks(d,f,5),xTicks:E(o)}}buildTicks(t,r,o){if(!Number.isFinite(t)||!Number.isFinite(r)||r===t)return Array.from({length:3},(s,e)=>t+(r-t)/2*e);const n=(r-t)/(o-1);return Array.from({length:o},(s,e)=>t+n*e)}renderPlaceholder(t){this.shadowRoot.innerHTML=`
      <style>${k}</style>
      <div class="card">
        <div class="empty">${t}<br /><small>v${A}</small></div>
      </div>
    `}renderLiveOnlyState(){const{title:t}=this._config,r=this._config.entities.map((o,n)=>{var e;const s=$((e=this._hass.states[o])==null?void 0:e.state);return{entityId:o,label:o.split(".").pop().replace(/_/g," "),color:this._config.colors[n%this._config.colors.length],points:s!==null?[{time:Date.now(),value:s}]:[]}}).filter(o=>o.points.length);this._chartData=this.buildChartData(r),this.render(),r.length||this.renderPlaceholder(`History access blocked — live data unavailable. v${A}`)}render(){var M,D;const t=this._chartData,{title:r,decimals:o}=this._config;if(!((M=t==null?void 0:t.series)!=null&&M.length)||!((D=t.times)!=null&&D.length)){this.renderPlaceholder("No chart data available for the selected time range.");return}const n=740,s=220,e={top:10,right:14,bottom:28,left:46},i=n-e.left-e.right,l=s-e.top-e.bottom,d=c=>{const p=Math.max(1,t.times.length-1);return e.left+c/p*i},f=c=>{const p=t.yMax-t.yMin||1;return e.top+l-(c-t.yMin)/p*l},h=Array.from({length:5},(c,p)=>{const b=e.left+p/4*i,v=t.xTicks[p]??t.xTicks[t.xTicks.length-1],m=v?new Date(v).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):"";return`<line class="grid-line" x1="${b}" y1="${e.top}" x2="${b}" y2="${e.top+l}" />
        <text class="axis-label" x="${b}" y="${s-14}" text-anchor="middle">${m}</text>`}).join(""),u=t.yTicks.map(c=>{const p=f(c);return`
        <line class="grid-line" x1="${e.left}" y1="${p}" x2="${n-e.right}" y2="${p}" />
        <text class="axis-label" x="${e.left-10}" y="${p+4}" text-anchor="end">${F(c,o)}</text>
      `}).join(""),x=t.series.map((c,p)=>{const b=c.points.reduce((m,_,w)=>{var S;if(_.value===null)return m;const N=d(w),L=f(_.value),j=w===0||((S=c.points[w-1])==null?void 0:S.value)===null?"M":"L";return`${m}${j}${N.toFixed(2)} ${L.toFixed(2)} `},"").trim(),v=c.points.filter(m=>m.value!==null).map(m=>{const _=d(c.points.indexOf(m)),w=f(m.value);return`<circle class="point" cx="${_}" cy="${w}" r="2.4" fill="${c.color}" />`}).join("");return`
        <path class="series-line" d="${b}" stroke="${c.color}" />
        ${v}
      `}).join(""),H=t.series.filter(c=>c.points.some(p=>Number.isFinite(p.value))).map(c=>`
      <span class="legend-item">
        <span class="legend-swatch" style="background: ${c.color};"></span>
        <span>${c.label}</span>
      </span>
    `).join("");this.shadowRoot.innerHTML=`
      <style>${k}</style>
      <div class="card">
        <h3 class="title">${r}</h3>
        <div class="chart-shell">
          <svg viewBox="0 0 ${n} ${s}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Electricity cost over time">
            <line class="axis-line" x1="${e.left}" y1="${e.top+l}" x2="${n-e.right}" y2="${e.top+l}" />
            <line class="axis-line" x1="${e.left}" y1="${e.top}" x2="${e.left}" y2="${e.top+l}" />
            ${h}
            ${u}
            ${x}
          </svg>
        </div>
        <div class="legend">${H}</div>
      </div>
    `}}return customElements.get("cost-chart-card")||customElements.define("cost-chart-card",C),window.customCards=window.customCards||[],window.customCards.some(a=>a.type==="cost-chart-card")||window.customCards.push({type:"cost-chart-card",name:"Cost Chart Card",description:"2D line chart for electricity cost sensors"}),C}();
//# sourceMappingURL=cost-chart-card.js.map
