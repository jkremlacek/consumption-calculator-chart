var ConsumptionCostChart=function(){"use strict";const S=`
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
`;function k(o){if(o==null||o==="")return null;const t=Number.parseFloat(o);return Number.isFinite(t)?t:null}function E(o,t,r=9e5){const c=Date.now()-t*60*60*1e3,n=new Map,a=e=>{Array.isArray(e)&&e.forEach(s=>{if(Array.isArray(s)){a(s);return}if(!s||typeof s!="object")return;(Array.isArray(s.states)?s.states:[s]).forEach(p=>{if(!p||typeof p!="object")return;const h=new Date(p.last_updated||p.last_changed||p.last_reported||p.time).getTime();if(!Number.isFinite(h)||h<c)return;const l=k(p.state??p.value);if(l===null)return;const u=Math.floor(h/r)*r,y=n.get(u);(!y||h>y.time)&&n.set(u,{time:h,value:l})})})};return a(o),Array.from(n.entries()).sort(([e],[s])=>e-s).map(([e,s])=>({time:e,value:s.value}))}function H(o,t){return Number.isFinite(o)?o.toFixed(t):"—"}function L(o){if(!o.length)return[];if(o.length===1)return[o[0]-36e5,o[0]];const t=Math.min(5,Math.max(2,o.length)),r=[];for(let n=0;n<t;n+=1){const a=Math.round(n/(t-1)*(o.length-1));r.push(o[a])}const c=[...new Set(r)];return c.length>1?c:[o[0],o[o.length-1]]}const C="1.0.9",w={title:"Electricity Cost",hours:24,decimals:2,colors:["#4fc3f7","#f9a825","#ef5350"],entities:["sensor.current_15min_cost","sensor.current_shared_cost_15min","sensor.current_grid_cost_15min"]};class M extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._hass=null,this._chartData=[],this._config={...w},this._ready=!1,this._historyBlocked=!1}setConfig(t){const r={...w,...t||{},colors:(t==null?void 0:t.colors)||w.colors,entities:Array.isArray(t==null?void 0:t.entities)?t.entities:w.entities};r.entities.length||(r.entities=w.entities),this._config=r,this._ready=!0,this.requestUpdate()}set hass(t){this._hass=t,this.requestUpdate()}requestUpdate(){if(!this._ready||!this._hass){this.renderPlaceholder("Waiting for Home Assistant state…");return}if(this._historyBlocked){this.renderLiveOnlyState();return}this.refreshData()}buildLiveSeries(){return this._config.entities.map((t,r)=>{var n;const c=k((n=this._hass.states[t])==null?void 0:n.state);return{entityId:t,label:t.split(".").pop().replace(/_/g," "),color:this._config.colors[r%this._config.colors.length],points:c!==null?[{time:Date.now(),value:c}]:[]}}).filter(t=>t.points.length)}async refreshData(){this._historyBlocked=!1;const{entities:t,hours:r}=this._config,c=new Date(Date.now()-r*60*60*1e3).toISOString(),n=new Date().toISOString();try{const a=await Promise.all(t.map(async(s,f)=>{var y;const p=await this.fetchHistoryForEntity(s,c,n),h=E(p,r),l=(y=this._hass.states[s])==null?void 0:y.state,u=k(l);return h.length>0&&u!==null&&h[h.length-1].time<Date.now()&&h.push({time:Date.now(),value:u}),{entityId:s,label:s.split(".").pop().replace(/_/g," "),color:this._config.colors[f%this._config.colors.length],points:h.sort((i,_)=>i.time-_.time)}}));if(!a.some(s=>s.points.length>0)){this.renderPlaceholder("No recorded history available for the selected period.");return}this._chartData=this.buildChartData(a),this.render()}catch(a){console.warn("CostChartCard history unavailable; using live state only.",a),this._historyBlocked=!0,this.renderLiveOnlyState()}}async fetchHistoryForEntity(t,r,c){var f,p,h,l,u,y;if(this._historyBlocked)return[];const n={start_time:r,end_time:c,filter_entity_id:t,minimal_response:!0,significant_changes_only:!1};if((f=this._hass)!=null&&f.callApi&&typeof this._hass.callApi=="function")try{const i=await this._hass.callApi("GET","history/period",n);return Array.isArray(i)?i:[]}catch(i){console.warn(`callApi history request failed for ${t}; falling back to fetch`,i)}const a=new URLSearchParams;Object.entries(n).forEach(([i,_])=>{const A=i==="filter_entity_id"?encodeURIComponent(String(_)):String(_);a.append(i,A)});const e=((l=(h=(p=this._hass)==null?void 0:p.auth)==null?void 0:h.data)==null?void 0:l.access_token)||((y=(u=this._hass)==null?void 0:u.auth)==null?void 0:y.access_token),s=`/api/history/period?${a.toString()}`;try{const i=await fetch(s,{headers:{...e?{Authorization:`Bearer ${e}`}:{}}});if(i.status===401||i.status===403)return console.warn(`History access denied for ${t}; continuing with direct HA history requests only.`),[];if(!i.ok)throw new Error(`History API returned ${i.status}`);const _=await i.json();return Array.isArray(_)?_:[]}catch(i){return console.warn(`History fetch unavailable for ${t}; continuing without fallback blocking.`,i),[]}}buildChartData(t){const r=new Set;t.forEach(l=>{l.points.forEach(u=>r.add(u.time))});const c=Array.from(r).sort((l,u)=>l-u),n=t.map(l=>{const u=new Map(l.points.map(i=>[i.time,i.value])),y=c.map(i=>({time:i,value:u.has(i)?u.get(i):null}));return{...l,points:y}}),a=n.flatMap(l=>l.points.map(u=>u.value)).filter(l=>Number.isFinite(l)),e=a.length?Math.min(...a):0,s=a.length?Math.max(...a):0,f=Math.max((s-e)*.15,.1),p=Math.max(0,e-f),h=s+f;return{series:n,times:c,yMin:p,yMax:h,yTicks:this.buildTicks(p,h,5),xTicks:L(c)}}buildTicks(t,r,c){if(!Number.isFinite(t)||!Number.isFinite(r)||r===t)return Array.from({length:3},(a,e)=>t+(r-t)/2*e);const n=(r-t)/(c-1);return Array.from({length:c},(a,e)=>t+n*e)}renderPlaceholder(t){this.shadowRoot.innerHTML=`
      <style>${S}</style>
      <div class="card">
        <div class="empty">${t}<br /><small>v${C}</small></div>
      </div>
    `}renderLiveOnlyState(){const t=this.buildLiveSeries();this._chartData=this.buildChartData(t),this.render(),t.length||this.renderPlaceholder(`History access blocked — live data unavailable. v${C}`)}render(){var D,T;const t=this._chartData,{title:r,decimals:c}=this._config;if(!((D=t==null?void 0:t.series)!=null&&D.length)||!((T=t.times)!=null&&T.length)){this.renderPlaceholder("No chart data available for the selected time range.");return}const n=740,a=220,e={top:10,right:14,bottom:28,left:46},s=n-e.left-e.right,f=a-e.top-e.bottom,p=t.times.length===1&&t.series.length>1,h=(d,g)=>{if(p){const b=Math.min(s*.28,90),m=(d-(t.series.length-1)/2)/Math.max(1,t.series.length-1)*b;return e.left+s*.82+m}const x=Math.max(1,t.times.length-1);return e.left+g/x*s},l=d=>{const g=t.yMax-t.yMin||1;return e.top+f-(d-t.yMin)/g*f},u=Array.from({length:5},(d,g)=>{const x=e.left+g/4*s,b=t.xTicks[g]??t.xTicks[t.xTicks.length-1],m=b?new Date(b).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):"";return`<line class="grid-line" x1="${x}" y1="${e.top}" x2="${x}" y2="${e.top+f}" />
        <text class="axis-label" x="${x}" y="${a-14}" text-anchor="middle">${m}</text>`}).join(""),y=t.yTicks.map(d=>{const g=l(d);return`
        <line class="grid-line" x1="${e.left}" y1="${g}" x2="${n-e.right}" y2="${g}" />
        <text class="axis-label" x="${e.left-10}" y="${g+4}" text-anchor="end">${H(d,c)}</text>
      `}).join(""),i=t.series.map((d,g)=>{const x=d.points.reduce((m,$,v)=>{var F;if($.value===null)return m;const N=h(g,v),j=l($.value),P=v===0||((F=d.points[v-1])==null?void 0:F.value)===null?"M":"L";return`${m}${P}${N.toFixed(2)} ${j.toFixed(2)} `},"").trim(),b=d.points.filter(m=>m.value!==null).map(m=>{const $=h(g,d.points.indexOf(m)),v=l(m.value);return`<circle class="point" cx="${$}" cy="${v}" r="2.4" fill="${d.color}" />`}).join("");return`
        <path class="series-line" d="${x}" stroke="${d.color}" />
        ${b}
      `}).join(""),A=this._config.entities.map((d,g)=>{var b;const x=t.series.find(m=>m.entityId===d);return{label:d.split(".").pop().replace(/_/g," "),color:this._config.colors[g%this._config.colors.length],hasData:(b=x==null?void 0:x.points)==null?void 0:b.some(m=>Number.isFinite(m.value))}}).map(d=>`
      <span class="legend-item">
        <span class="legend-swatch" style="background: ${d.color};"></span>
        <span>${d.label}</span>
      </span>
    `).join("");this.shadowRoot.innerHTML=`
      <style>${S}</style>
      <div class="card">
        <h3 class="title">${r}</h3>
        <div class="chart-shell">
          <svg viewBox="0 0 ${n} ${a}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Electricity cost over time">
            <line class="axis-line" x1="${e.left}" y1="${e.top+f}" x2="${n-e.right}" y2="${e.top+f}" />
            <line class="axis-line" x1="${e.left}" y1="${e.top}" x2="${e.left}" y2="${e.top+f}" />
            ${u}
            ${y}
            ${i}
          </svg>
        </div>
        <div class="legend">${A}</div>
      </div>
    `}}return customElements.get("cost-chart-card")||customElements.define("cost-chart-card",M),window.customCards=window.customCards||[],window.customCards.some(o=>o.type==="cost-chart-card")||window.customCards.push({type:"cost-chart-card",name:"Cost Chart Card",description:"2D line chart for electricity cost sensors"}),M}();
//# sourceMappingURL=cost-chart-card.js.map
