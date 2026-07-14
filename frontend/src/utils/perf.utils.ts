/**
 * Performance Monitoring Utilities
 * Lightweight wrappers around the browser Performance API.
 */

/**
 * Logs Time to First Byte (TTFB) and other navigation timing metrics.
 */
export const measureNavigationTiming = () => {
  if (typeof performance === 'undefined') return;

  const [navEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  if (!navEntry) return;

  const ttfb = navEntry.responseStart - navEntry.requestStart;
  const domLoad = navEntry.domContentLoadedEventEnd - navEntry.startTime;

  console.log(`[Perf] TTFB: ${Math.round(ttfb)}ms | DOM Load: ${Math.round(domLoad)}ms`);
};

/**
 * Creates a marked duration measurement for a specific render or action.
 * @param label The name of the measurement (e.g. 'menu-render')
 * @returns A function to call when the action completes to log the duration.
 */
export const startMeasure = (label: string) => {
  if (typeof performance === 'undefined') return () => {};

  const startMark = `${label}-start`;
  const endMark = `${label}-end`;

  performance.mark(startMark);

  return () => {
    performance.mark(endMark);
    performance.measure(label, startMark, endMark);
    const [measure] = performance.getEntriesByName(label);
    if (measure) {
      console.log(`[Perf] ${label}: ${Math.round(measure.duration)}ms`);
    }
    // Cleanup
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(label);
  };
};

/**
 * Listens for Core Web Vitals (LCP, FID, CLS) using PerformanceObserver
 */
export const initWebVitals = () => {
  if (typeof PerformanceObserver === 'undefined') return;

  const logEntry = (entry: PerformanceEntry) => {
    console.log(`[Web Vital] ${entry.entryType}:`, entry);
  };

  try {
    ['largest-contentful-paint', 'first-input', 'layout-shift'].forEach((type) => {
      const po = new PerformanceObserver((list) => {
        list.getEntries().forEach(logEntry);
      });
      po.observe({ type, buffered: true });
    });
  } catch (e) {
    // Some browsers might not support all types
    console.warn('Web Vitals observation not fully supported', e);
  }
};
