export function toNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export function normalizeHistory(historyItems, hours, stepMs = 15 * 60 * 1000) {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  const buckets = new Map();

  (Array.isArray(historyItems) ? historyItems : []).forEach((entry) => {
    const states = Array.isArray(entry?.states) ? entry.states : [];

    states.forEach((state) => {
      const timeStamp = new Date(state.last_updated || state.last_changed || state.last_reported).getTime();
      if (!Number.isFinite(timeStamp) || timeStamp < cutoff) {
        return;
      }

      const key = Math.floor(timeStamp / stepMs) * stepMs;
      const value = toNumber(state.state);

      if (value === null) {
        return;
      }

      const previous = buckets.get(key);
      if (!previous || timeStamp > previous.time) {
        buckets.set(key, { time: timeStamp, value });
      }
    });
  });

  return Array.from(buckets.entries())
    .sort(([left], [right]) => left - right)
    .map(([time, point]) => ({ time, value: point.value }));
}

export function formatValue(value, decimals) {
  return Number.isFinite(value) ? value.toFixed(decimals) : '—';
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function buildTimeLabels(times) {
  if (!times.length) {
    return [];
  }

  const step = Math.max(1, Math.ceil(times.length / 6));
  return times.filter((_, index) => index % step === 0 || index === times.length - 1);
}
