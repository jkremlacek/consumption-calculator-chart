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
`;function A(a){if(a==null||a==="")return null;const t=Number.parseFloat(a);return Number.isFinite(t)?t:null}function F(a,t,i=9e5){const c=Date.now()-t*60*60*1e3,n=new Map,o=e=>{Array.isArray(e)&&e.forEach(s=>{if(Array.isArray(s)){o(s);return}if(!s||typeof s!="object")return;(Array.isArray(s.states)?s.states:[s]).forEach(p=>{if(!p||typeof p!="object")return;const h=new Date(p.last_updated||p.last_changed||p.last_reported||p.time).getTime();if(!Number.isFinite(h)||h<c)return;const l=A(p.state??p.value);if(l===null)return;const u=Math.floor(h/i)*i,y=n.get(u);(!y||h>y.time)&&n.set(u,{time:h,value:l})})})};return o(a),Array.from(n.entries()).sort(([e],[s])=>e-s).map(([e,s])=>({time:e,value:s.value}))}function H(a,t){return Number.isFinite(a)?a.toFixed(t):"—"}function L(a){if(!a.length)return[];if(a.length===1)return[a[0]-36e5,a[0]];const t=Math.min(5,Math.max(2,a.length)),i=[];for(let n=0;n<t;n+=1){const o=Math.round(n/(t-1)*(a.length-1));i.push(a[o])}const c=[...new Set(i)];return c.length>1?c:[a[0],a[a.length-1]]}const D="1.0.8",v={title:"Electricity Cost",hours:24,decimals:2,colors:["#4fc3f7","#f9a825","#ef5350"],entities:["sensor.current_15min_cost","sensor.current_shared_cost_15min","sensor.current_grid_cost_15min"]};class C extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._hass=null,this._chartData=[],this._config={...v},this._ready=!1,this._historyBlocked=!1,this._historyDisabledEntities=new Set}setConfig(t){const i={...v,...t||{},colors:(t==null?void 0:t.colors)||v.colors,entities:Array.isArray(t==null?void 0:t.entities)?t.entities:v.entities};i.entities.length||(i.entities=v.entities),this._config=i,this._ready=!0,this.requestUpdate()}set hass(t){this._hass=t,this.requestUpdate()}requestUpdate(){if(!this._ready||!this._hass){this.renderPlaceholder("Waiting for Home Assistant state…");return}if(this._historyBlocked){this.renderLiveOnlyState();return}this.refreshData()}buildLiveSeries(){return this._config.entities.map((t,i)=>{var n;const c=A((n=this._hass.states[t])==null?void 0:n.state);return{entityId:t,label:t.split(".").pop().replace(/_/g," "),color:this._config.colors[i%this._config.colors.length],points:c!==null?[{time:Date.now(),value:c}]:[]}}).filter(t=>t.points.length)}async refreshData(){this._historyBlocked=!1;const{entities:t,hours:i}=this._config,c=new Date(Date.now()-i*60*60*1e3).toISOString(),n=new Date().toISOString();try{const o=await Promise.all(t.map(async(s,f)=>{var y;const p=this._historyDisabledEntities.has(s)?[]:await this.fetchHistoryForEntity(s,c,n),h=F(p,i),l=(y=this._hass.states[s])==null?void 0:y.state,u=A(l);return u!==null&&(!h.length||h[h.length-1].time<Date.now())&&h.push({time:Date.now(),value:u}),{entityId:s,label:s.split(".").pop().replace(/_/g," "),color:this._config.colors[f%this._config.colors.length],points:h.sort((r,x)=>r.time-x.time)}})),e=o.some(s=>s.points.length>0);this._chartData=this.buildChartData(e?o:this.buildLiveSeries()),this.render()}catch(o){console.warn("CostChartCard history unavailable; using live state only.",o),this._historyBlocked=!0,this.renderLiveOnlyState()}}async fetchHistoryForEntity(t,i,c){var f,p,h,l,u,y;if(this._historyBlocked||this._historyDisabledEntities.has(t))return[];const n={start_time:i,end_time:c,filter_entity_id:t,minimal_response:!0,significant_changes_only:!1};if((f=this._hass)!=null&&f.callApi&&typeof this._hass.callApi=="function")try{const r=await this._hass.callApi("GET","history/period",n),x=Array.isArray(r)?r:[];return x.length||this._historyDisabledEntities.add(t),x}catch(r){console.warn(`callApi history request failed for ${t}; falling back to fetch`,r)}const o=new URLSearchParams;Object.entries(n).forEach(([r,x])=>{const w=r==="filter_entity_id"?encodeURIComponent(String(x)):String(x);o.append(r,w)});const e=((l=(h=(p=this._hass)==null?void 0:p.auth)==null?void 0:h.data)==null?void 0:l.access_token)||((y=(u=this._hass)==null?void 0:u.auth)==null?void 0:y.access_token),s=`/api/history/period?${o.toString()}`;try{const r=await fetch(s,{headers:{...e?{Authorization:`Bearer ${e}`}:{}}});if(r.status===401||r.status===403)return console.warn(`History access denied for ${t}; continuing with direct HA history requests only.`),[];if(!r.ok)throw new Error(`History API returned ${r.status}`);const x=await r.json(),w=Array.isArray(x)?x:[];return w.length||this._historyDisabledEntities.add(t),w}catch(r){return console.warn(`History fetch unavailable for ${t}; continuing without fallback blocking.`,r),[]}}buildChartData(t){const i=new Set;t.forEach(l=>{l.points.forEach(u=>i.add(u.time))});const c=Array.from(i).sort((l,u)=>l-u),n=t.map(l=>{const u=new Map(l.points.map(r=>[r.time,r.value])),y=c.map(r=>({time:r,value:u.has(r)?u.get(r):null}));return{...l,points:y}}),o=n.flatMap(l=>l.points.map(u=>u.value)).filter(l=>Number.isFinite(l)),e=o.length?Math.min(...o):0,s=o.length?Math.max(...o):0,f=Math.max((s-e)*.15,.1),p=Math.max(0,e-f),h=s+f;return{series:n,times:c,yMin:p,yMax:h,yTicks:this.buildTicks(p,h,5),xTicks:L(c)}}buildTicks(t,i,c){if(!Number.isFinite(t)||!Number.isFinite(i)||i===t)return Array.from({length:3},(o,e)=>t+(i-t)/2*e);const n=(i-t)/(c-1);return Array.from({length:c},(o,e)=>t+n*e)}renderPlaceholder(t){this.shadowRoot.innerHTML=`
      <style>${S}</style>
      <div class="card">
        <div class="empty">${t}<br /><small>v${D}</small></div>
      </div>
    `}renderLiveOnlyState(){const t=this.buildLiveSeries();this._chartData=this.buildChartData(t),this.render(),t.length||this.renderPlaceholder(`History access blocked — live data unavailable. v${D}`)}render(){var M,T;const t=this._chartData,{title:i,decimals:c}=this._config;if(!((M=t==null?void 0:t.series)!=null&&M.length)||!((T=t.times)!=null&&T.length)){this.renderPlaceholder("No chart data available for the selected time range.");return}const n=740,o=220,e={top:10,right:14,bottom:28,left:46},s=n-e.left-e.right,f=o-e.top-e.bottom,p=t.times.length===1&&t.series.length>1,h=(d,g)=>{if(p){const _=Math.min(s*.28,90),m=(d-(t.series.length-1)/2)/Math.max(1,t.series.length-1)*_;return e.left+s*.82+m}const b=Math.max(1,t.times.length-1);return e.left+g/b*s},l=d=>{const g=t.yMax-t.yMin||1;return e.top+f-(d-t.yMin)/g*f},u=Array.from({length:5},(d,g)=>{const b=e.left+g/4*s,_=t.xTicks[g]??t.xTicks[t.xTicks.length-1],m=_?new Date(_).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):"";return`<line class="grid-line" x1="${b}" y1="${e.top}" x2="${b}" y2="${e.top+f}" />
        <text class="axis-label" x="${b}" y="${o-14}" text-anchor="middle">${m}</text>`}).join(""),y=t.yTicks.map(d=>{const g=l(d);return`
        <line class="grid-line" x1="${e.left}" y1="${g}" x2="${n-e.right}" y2="${g}" />
        <text class="axis-label" x="${e.left-10}" y="${g+4}" text-anchor="end">${H(d,c)}</text>
      `}).join(""),r=t.series.map((d,g)=>{const b=d.points.reduce((m,k,$)=>{var E;if(k.value===null)return m;const j=h(g,$),N=l(k.value),O=$===0||((E=d.points[$-1])==null?void 0:E.value)===null?"M":"L";return`${m}${O}${j.toFixed(2)} ${N.toFixed(2)} `},"").trim(),_=d.points.filter(m=>m.value!==null).map(m=>{const k=h(g,d.points.indexOf(m)),$=l(m.value);return`<circle class="point" cx="${k}" cy="${$}" r="2.4" fill="${d.color}" />`}).join("");return`
        <path class="series-line" d="${b}" stroke="${d.color}" />
        ${_}
      `}).join(""),w=this._config.entities.map((d,g)=>{var _;const b=t.series.find(m=>m.entityId===d);return{label:d.split(".").pop().replace(/_/g," "),color:this._config.colors[g%this._config.colors.length],hasData:(_=b==null?void 0:b.points)==null?void 0:_.some(m=>Number.isFinite(m.value))}}).map(d=>`
      <span class="legend-item">
        <span class="legend-swatch" style="background: ${d.color};"></span>
        <span>${d.label}</span>
      </span>
    `).join("");this.shadowRoot.innerHTML=`
      <style>${S}</style>
      <div class="card">
        <h3 class="title">${i}</h3>
        <div class="chart-shell">
          <svg viewBox="0 0 ${n} ${o}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Electricity cost over time">
            <line class="axis-line" x1="${e.left}" y1="${e.top+f}" x2="${n-e.right}" y2="${e.top+f}" />
            <line class="axis-line" x1="${e.left}" y1="${e.top}" x2="${e.left}" y2="${e.top+f}" />
            ${u}
            ${y}
            ${r}
          </svg>
        </div>
        <div class="legend">${w}</div>
      </div>
    `}}return customElements.get("cost-chart-card")||customElements.define("cost-chart-card",C),window.customCards=window.customCards||[],window.customCards.some(a=>a.type==="cost-chart-card")||window.customCards.push({type:"cost-chart-card",name:"Cost Chart Card",description:"2D line chart for electricity cost sensors"}),C}();
//# sourceMappingURL=cost-chart-card.js.map
