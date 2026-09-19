import { styles } from "./styles.js";
import {
  buildTimeLabels,
  clamp,
  formatValue,
  normalizeHistory,
  toNumber,
} from "./helpers.js";

const DEFAULT_CONFIG = {
  title: "Electricity Cost",
  hours: 24,
  decimals: 2,
  colors: ["#4fc3f7", "#f9a825", "#ef5350"],
  entities: [
    "sensor.current_15min_cost",
    "sensor.current_shared_cost_15min",
    "sensor.current_grid_cost_15min",
  ],
};

class CostChartCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._chartData = [];
    this._config = { ...DEFAULT_CONFIG };
    this._ready = false;
    this._historyBlocked = false;
  }

  setConfig(config) {
    const merged = {
      ...DEFAULT_CONFIG,
      ...(config || {}),
      colors: config?.colors || DEFAULT_CONFIG.colors,
      entities: Array.isArray(config?.entities)
        ? config.entities
        : DEFAULT_CONFIG.entities,
    };

    if (!merged.entities.length) {
      merged.entities = DEFAULT_CONFIG.entities;
    }

    this._config = merged;
    this._ready = true;
    this.requestUpdate();
  }

  set hass(value) {
    this._hass = value;
    this.requestUpdate();
  }

  requestUpdate() {
    if (!this._ready || !this._hass) {
      this.renderPlaceholder("Waiting for Home Assistant state…");
      return;
    }

    this.refreshData();
  }

  async refreshData() {
    const { entities, hours } = this._config;
    const startTime = new Date(
      Date.now() - hours * 60 * 60 * 1000,
    ).toISOString();
    const endTime = new Date().toISOString();

    try {
      const series = await Promise.all(
        entities.map(async (entityId, index) => {
          const history = await this.fetchHistoryForEntity(
            entityId,
            startTime,
            endTime,
          );
          const points = normalizeHistory(history, hours);
          const currentState = this._hass.states[entityId]?.state;
          const currentValue = toNumber(currentState);

          if (
            currentValue !== null &&
            (!points.length || points[points.length - 1].time < Date.now())
          ) {
            points.push({ time: Date.now(), value: currentValue });
          }

          return {
            entityId,
            label: entityId.split(".").pop().replace(/_/g, " "),
            color: this._config.colors[index % this._config.colors.length],
            points: points.sort((a, b) => a.time - b.time),
          };
        }),
      );

      this._chartData = this.buildChartData(series);
      this.render();
    } catch (error) {
      console.warn("CostChartCard history unavailable; using live state only.", error);
      const fallbackSeries = entities.map((entityId, index) => {
        const currentValue = toNumber(this._hass.states[entityId]?.state);
        return {
          entityId,
          label: entityId.split(".").pop().replace(/_/g, " "),
          color: this._config.colors[index % this._config.colors.length],
          points: currentValue !== null ? [{ time: Date.now(), value: currentValue }] : [],
        };
      });

      this._chartData = this.buildChartData(fallbackSeries);
      this.render();
    }
  }

  async fetchHistoryForEntity(entityId, startTime, endTime) {
    if (this._historyBlocked) {
      return [];
    }

    const params = {
      start_time: startTime,
      end_time: endTime,
      filter_entity_id: entityId,
      minimal_response: true,
      significant_changes_only: false,
    };

    if (this._hass?.callApi && typeof this._hass.callApi === "function") {
      try {
        const response = await this._hass.callApi(
          "GET",
          "history/period",
          params,
        );
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.warn(
          `callApi history request failed for ${entityId}; falling back to fetch`,
          error,
        );
      }
    }

    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      query.append(key, String(value));
    });

    try {
      const response = await fetch(`/api/history/period?${query.toString()}`);
      if (response.status === 401 || response.status === 403) {
        this._historyBlocked = true;
        console.warn(`History access denied for ${entityId}; using live state only.`);
        return [];
      }

      if (!response.ok) {
        throw new Error(`History API returned ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      this._historyBlocked = true;
      console.warn(`History fetch unavailable for ${entityId}; using live state only.`, error);
      return [];
    }
  }

  buildChartData(series) {
    const allTimes = new Set();
    series.forEach((entry) => {
      entry.points.forEach((point) => allTimes.add(point.time));
    });

    const sortedTimes = Array.from(allTimes).sort((a, b) => a - b);
    const normalizedSeries = series.map((entry) => {
      const pointMap = new Map(
        entry.points.map((point) => [point.time, point.value]),
      );
      const alignedPoints = sortedTimes.map((time) => ({
        time,
        value: pointMap.has(time) ? pointMap.get(time) : null,
      }));

      return {
        ...entry,
        points: alignedPoints,
      };
    });

    const allValues = normalizedSeries
      .flatMap((entry) => entry.points.map((point) => point.value))
      .filter((value) => Number.isFinite(value));

    const minValue = allValues.length ? Math.min(...allValues) : 0;
    const maxValue = allValues.length ? Math.max(...allValues) : 0;
    const yPadding = Math.max((maxValue - minValue) * 0.15, 0.1);
    const yMin = Math.max(0, minValue - yPadding);
    const yMax = maxValue + yPadding;

    return {
      series: normalizedSeries,
      times: sortedTimes,
      yMin,
      yMax,
      yTicks: this.buildTicks(yMin, yMax, 5),
      xTicks: buildTimeLabels(sortedTimes),
    };
  }

  buildTicks(min, max, count) {
    if (!Number.isFinite(min) || !Number.isFinite(max) || max === min) {
      return Array.from({ length: 3 }, (_, i) => min + ((max - min) / 2) * i);
    }

    const step = (max - min) / (count - 1);
    return Array.from({ length: count }, (_, i) => min + step * i);
  }

  renderPlaceholder(message) {
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="card">
        <div class="empty">${message}</div>
      </div>
    `;
  }

  render() {
    const data = this._chartData;
    const { title, decimals } = this._config;

    if (!data?.series?.length || !data.times?.length) {
      this.renderPlaceholder(
        "No chart data available for the selected time range.",
      );
      return;
    }

    const width = 740;
    const height = 280;
    const margin = { top: 20, right: 14, bottom: 40, left: 52 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const xForIndex = (index) => {
      const count = Math.max(1, data.times.length - 1);
      return margin.left + (index / count) * plotWidth;
    };

    const yForValue = (value) => {
      const range = data.yMax - data.yMin || 1;
      return (
        margin.top + plotHeight - ((value - data.yMin) / range) * plotHeight
      );
    };

    const xAxis = Array.from({ length: 5 }, (_, index) => {
      const x = margin.left + (index / 4) * plotWidth;
      const labelTime =
        data.xTicks[index] ?? data.xTicks[data.xTicks.length - 1];
      const label = labelTime
        ? new Date(labelTime).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })
        : "";
      return `<line class="grid-line" x1="${x}" y1="${margin.top}" x2="${x}" y2="${margin.top + plotHeight}" />
        <text class="axis-label" x="${x}" y="${height - 14}" text-anchor="middle">${label}</text>`;
    }).join("");

    const yAxis = data.yTicks
      .map((tick) => {
        const y = yForValue(tick);
        return `
        <line class="grid-line" x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" />
        <text class="axis-label" x="${margin.left - 10}" y="${y + 4}" text-anchor="end">${formatValue(tick, decimals)}</text>
      `;
      })
      .join("");

    const seriesPaths = data.series
      .map((series, index) => {
        const path = series.points
          .reduce((acc, point, pointIndex) => {
            if (point.value === null) {
              return acc;
            }

            const x = xForIndex(pointIndex);
            const y = yForValue(point.value);
            const command =
              pointIndex === 0 || series.points[pointIndex - 1]?.value === null
                ? "M"
                : "L";
            return `${acc}${command}${x.toFixed(2)} ${y.toFixed(2)} `;
          }, "")
          .trim();

        const dots = series.points
          .filter((point) => point.value !== null)
          .map((point) => {
            const x = xForIndex(series.points.indexOf(point));
            const y = yForValue(point.value);
            return `<circle class="point" cx="${x}" cy="${y}" r="2.4" fill="${series.color}" />`;
          })
          .join("");

        return `
        <path class="series-line" d="${path}" stroke="${series.color}" />
        ${dots}
      `;
      })
      .join("");

    const legend = data.series
      .map(
        (series) => `
      <span class="legend-item">
        <span class="legend-swatch" style="background: ${series.color};"></span>
        <span>${series.label}</span>
      </span>
    `,
      )
      .join("");

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="card">
        <div class="header">
          <h3 class="title">${title}</h3>
          <div class="legend">${legend}</div>
        </div>
        <div class="chart-shell">
          <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Electricity cost over time">
            <line class="axis-line" x1="${margin.left}" y1="${margin.top + plotHeight}" x2="${width - margin.right}" y2="${margin.top + plotHeight}" />
            <line class="axis-line" x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + plotHeight}" />
            ${xAxis}
            ${yAxis}
            ${seriesPaths}
          </svg>
        </div>
      </div>
    `;
  }
}

if (!customElements.get("cost-chart-card")) {
  customElements.define("cost-chart-card", CostChartCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "cost-chart-card")) {
  window.customCards.push({
    type: "cost-chart-card",
    name: "Cost Chart Card",
    description: "2D line chart for electricity cost sensors",
  });
}

export default CostChartCard;
