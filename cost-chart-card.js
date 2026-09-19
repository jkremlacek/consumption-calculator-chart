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
`;function $(i){if(i==null||i==="")return null;const t=Number.parseFloat(i);return Number.isFinite(t)?t:null}function S(i,t,r=9e5){const n=Date.now()-t*60*60*1e3,a=new Map;return(Array.isArray(i)?i:[]).forEach(s=>{(Array.isArray(s==null?void 0:s.states)?s.states:[]).forEach(p=>{const l=new Date(p.last_updated||p.last_changed||p.last_reported).getTime();if(!Number.isFinite(l)||l<n)return;const d=Math.floor(l/r)*r,f=$(p.state);if(f===null)return;const o=a.get(d);(!o||l>o.time)&&a.set(d,{time:l,value:f})})}),Array.from(a.entries()).sort(([s],[e])=>s-e).map(([s,e])=>({time:s,value:e.value}))}function F(i,t){return Number.isFinite(i)?i.toFixed(t):"—"}function E(i){if(!i.length)return[];if(i.length===1)return[i[0]-36e5,i[0]];const t=Math.min(5,Math.max(2,i.length)),r=[];for(let a=0;a<t;a+=1){const s=Math.round(a/(t-1)*(i.length-1));r.push(i[s])}const n=[...new Set(r)];return n.length>1?n:[i[0],i[i.length-1]]}const A="1.0.2",x={title:"Electricity Cost",hours:24,decimals:2,colors:["#4fc3f7","#f9a825","#ef5350"],entities:["sensor.current_15min_cost","sensor.current_shared_cost_15min","sensor.current_grid_cost_15min"]};class C extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._hass=null,this._chartData=[],this._config={...x},this._ready=!1,this._historyBlocked=!1}setConfig(t){const r={...x,...t||{},colors:(t==null?void 0:t.colors)||x.colors,entities:Array.isArray(t==null?void 0:t.entities)?t.entities:x.entities};r.entities.length||(r.entities=x.entities),this._config=r,this._ready=!0,this.requestUpdate()}set hass(t){this._hass=t,this.requestUpdate()}requestUpdate(){if(!this._ready||!this._hass){this.renderPlaceholder("Waiting for Home Assistant state…");return}if(this._historyBlocked){this.renderLiveOnlyState();return}this.refreshData()}async refreshData(){const{entities:t,hours:r}=this._config,n=new Date(Date.now()-r*60*60*1e3).toISOString(),a=new Date().toISOString();try{const s=await Promise.all(t.map(async(e,p)=>{var u;const l=await this.fetchHistoryForEntity(e,n,a),d=S(l,r),f=(u=this._hass.states[e])==null?void 0:u.state,o=$(f);return o!==null&&(!d.length||d[d.length-1].time<Date.now())&&d.push({time:Date.now(),value:o}),{entityId:e,label:e.split(".").pop().replace(/_/g," "),color:this._config.colors[p%this._config.colors.length],points:d.sort((c,g)=>c.time-g.time)}}));this._chartData=this.buildChartData(s),this.render()}catch(s){console.warn("CostChartCard history unavailable; using live state only.",s),this._historyBlocked=!0,this.renderLiveOnlyState()}}async fetchHistoryForEntity(t,r,n){var p,l,d,f,o,u;if(this._historyBlocked)return[];const a={start_time:r,end_time:n,filter_entity_id:t,minimal_response:!0,significant_changes_only:!1};if((p=this._hass)!=null&&p.callApi&&typeof this._hass.callApi=="function")try{const c=await this._hass.callApi("GET","history/period",a);return Array.isArray(c)?c:[]}catch(c){console.warn(`callApi history request failed for ${t}; falling back to fetch`,c)}const s=new URLSearchParams;Object.entries(a).forEach(([c,g])=>{s.append(c,String(g))});const e=((f=(d=(l=this._hass)==null?void 0:l.auth)==null?void 0:d.data)==null?void 0:f.access_token)||((u=(o=this._hass)==null?void 0:o.auth)==null?void 0:u.access_token);try{const c=await fetch(`/api/history/period?${s.toString()}`,{headers:{...e?{Authorization:`Bearer ${e}`}:{}}});if(c.status===401||c.status===403)return this._historyBlocked=!0,console.warn(`History access denied for ${t}; using live state only.`),[];if(!c.ok)throw new Error(`History API returned ${c.status}`);const g=await c.json();return Array.isArray(g)?g:[]}catch(c){return this._historyBlocked=!0,console.warn(`History fetch unavailable for ${t}; using live state only.`,c),[]}}buildChartData(t){const r=new Set;t.forEach(o=>{o.points.forEach(u=>r.add(u.time))});const n=Array.from(r).sort((o,u)=>o-u),a=t.map(o=>{const u=new Map(o.points.map(g=>[g.time,g.value])),c=n.map(g=>({time:g,value:u.has(g)?u.get(g):null}));return{...o,points:c}}),s=a.flatMap(o=>o.points.map(u=>u.value)).filter(o=>Number.isFinite(o)),e=s.length?Math.min(...s):0,p=s.length?Math.max(...s):0,l=Math.max((p-e)*.15,.1),d=Math.max(0,e-l),f=p+l;return{series:a,times:n,yMin:d,yMax:f,yTicks:this.buildTicks(d,f,5),xTicks:E(n)}}buildTicks(t,r,n){if(!Number.isFinite(t)||!Number.isFinite(r)||r===t)return Array.from({length:3},(s,e)=>t+(r-t)/2*e);const a=(r-t)/(n-1);return Array.from({length:n},(s,e)=>t+a*e)}renderPlaceholder(t){this.shadowRoot.innerHTML=`
      <style>${k}</style>
      <div class="card">
        <div class="empty">${t}<br /><small>v${A}</small></div>
      </div>
    `}renderLiveOnlyState(){const{title:t}=this._config,r=this._config.entities.map((n,a)=>{var e;const s=$((e=this._hass.states[n])==null?void 0:e.state);return{entityId:n,label:n.split(".").pop().replace(/_/g," "),color:this._config.colors[a%this._config.colors.length],points:s!==null?[{time:Date.now(),value:s}]:[]}}).filter(n=>n.points.length);this._chartData=this.buildChartData(r),this.render(),r.length||this.renderPlaceholder(`History access blocked — live data unavailable. v${A}`)}render(){var M,T;const t=this._chartData,{title:r,decimals:n}=this._config;if(!((M=t==null?void 0:t.series)!=null&&M.length)||!((T=t.times)!=null&&T.length)){this.renderPlaceholder("No chart data available for the selected time range.");return}const a=740,s=220,e={top:10,right:14,bottom:28,left:46},p=a-e.left-e.right,l=s-e.top-e.bottom,d=h=>{const m=Math.max(1,t.times.length-1);return e.left+h/m*p},f=h=>{const m=t.yMax-t.yMin||1;return e.top+l-(h-t.yMin)/m*l},o=Array.from({length:5},(h,m)=>{const b=e.left+m/4*p,w=t.xTicks[m]??t.xTicks[t.xTicks.length-1],y=w?new Date(w).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):"";return`<line class="grid-line" x1="${b}" y1="${e.top}" x2="${b}" y2="${e.top+l}" />
        <text class="axis-label" x="${b}" y="${s-14}" text-anchor="middle">${y}</text>`}).join(""),u=t.yTicks.map(h=>{const m=f(h);return`
        <line class="grid-line" x1="${e.left}" y1="${m}" x2="${a-e.right}" y2="${m}" />
        <text class="axis-label" x="${e.left-10}" y="${m+4}" text-anchor="end">${F(h,n)}</text>
      `}).join(""),c=t.series.map((h,m)=>{const b=h.points.reduce((y,v,_)=>{var D;if(v.value===null)return y;const N=d(_),L=f(v.value),j=_===0||((D=h.points[_-1])==null?void 0:D.value)===null?"M":"L";return`${y}${j}${N.toFixed(2)} ${L.toFixed(2)} `},"").trim(),w=h.points.filter(y=>y.value!==null).map(y=>{const v=d(h.points.indexOf(y)),_=f(y.value);return`<circle class="point" cx="${v}" cy="${_}" r="2.4" fill="${h.color}" />`}).join("");return`
        <path class="series-line" d="${b}" stroke="${h.color}" />
        ${w}
      `}).join(""),H=t.series.filter(h=>h.points.some(m=>Number.isFinite(m.value))).map(h=>`
      <span class="legend-item">
        <span class="legend-swatch" style="background: ${h.color};"></span>
        <span>${h.label}</span>
      </span>
    `).join("");this.shadowRoot.innerHTML=`
      <style>${k}</style>
      <div class="card">
        <h3 class="title">${r}</h3>
        <div class="chart-shell">
          <svg viewBox="0 0 ${a} ${s}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Electricity cost over time">
            <line class="axis-line" x1="${e.left}" y1="${e.top+l}" x2="${a-e.right}" y2="${e.top+l}" />
            <line class="axis-line" x1="${e.left}" y1="${e.top}" x2="${e.left}" y2="${e.top+l}" />
            ${o}
            ${u}
            ${c}
          </svg>
        </div>
        <div class="legend">${H}</div>
      </div>
    `}}return customElements.get("cost-chart-card")||customElements.define("cost-chart-card",C),window.customCards=window.customCards||[],window.customCards.some(i=>i.type==="cost-chart-card")||window.customCards.push({type:"cost-chart-card",name:"Cost Chart Card",description:"2D line chart for electricity cost sensors"}),C}();
//# sourceMappingURL=cost-chart-card.js.map
