export function createIntervalTimer(onTick, intervalMs = 1000) {
  let intervalId = null;

  return {
    start() {
      if (intervalId !== null) {
        return;
      }
      intervalId = window.setInterval(onTick, intervalMs);
    },
    stop() {
      if (intervalId === null) {
        return;
      }
      window.clearInterval(intervalId);
      intervalId = null;
    },
    isRunning() {
      return intervalId !== null;
    },
  };
}
