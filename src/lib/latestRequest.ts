// Responses can arrive out of order (e.g. switching league tabs quickly), so a
// page only applies a response while its request is still the latest one.
export function createLatestRequestTracker() {
  let latest = 0;
  return {
    start() {
      const id = ++latest;
      return () => id === latest;
    }
  };
}
