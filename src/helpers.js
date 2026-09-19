export function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export function normalizeHistory(historyItems, hours, stepMs = 15 * 60 * 1000) {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  const buckets = new Map();

  const collectStates = (entries) => {
    if (!Array.isArray(entries)) {
      return;
    }

    entries.forEach((entry) => {
      if (Array.isArray(entry)) {
        collectStates(entry);
        return;
      }

      if (!entry || typeof entry !== "object") {
        return;
      }

      const states = Array.isArray(entry.states) ? entry.states : [entry];

      states.forEach((state) => {
        if (!state || typeof state !== "object") {
          return;
        }

        const timeStamp = new Date(
          state.last_updated ||
            state.last_changed ||
            state.last_reported ||
            state.time,
        ).getTime();

        if (!Number.isFinite(timeStamp) || timeStamp < cutoff) {
          return;
        }

        const value = toNumber(state.state ?? state.value);
        if (value === null) {
          return;
        }

        const key = Math.floor(timeStamp / stepMs) * stepMs;
        const previous = buckets.get(key);
        if (!previous || timeStamp > previous.time) {
          buckets.set(key, { time: timeStamp, value });
        }
      });
    });
  };

  collectStates(historyItems);

  return Array.from(buckets.entries())
    .sort(([left], [right]) => left - right)
    .map(([time, point]) => ({ time, value: point.value }));
}

export function formatValue(value, decimals) {
  return Number.isFinite(value) ? value.toFixed(decimals) : "—";
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function buildTimeLabels(times) {
  if (!times.length) {
    return [];
  }

  if (times.length === 1) {
    return [times[0] - 60 * 60 * 1000, times[0]];
  }

  const tickCount = Math.min(5, Math.max(2, times.length));
  const result = [];
  for (let i = 0; i < tickCount; i += 1) {
    const index = Math.round((i / (tickCount - 1)) * (times.length - 1));
    result.push(times[index]);
  }

  const deduped = [...new Set(result)];
  return deduped.length > 1 ? deduped : [times[0], times[times.length - 1]];
}
