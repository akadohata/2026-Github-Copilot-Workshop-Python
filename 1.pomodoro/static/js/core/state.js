export const MODES = {
  work: "work",
  shortBreak: "shortBreak",
  longBreak: "longBreak",
};

export const DEFAULT_DURATIONS = {
  [MODES.work]: 25 * 60,
  [MODES.shortBreak]: 5 * 60,
  [MODES.longBreak]: 15 * 60,
};

export const CYCLES_BEFORE_LONG_BREAK = 4;

export function createInitialState({
  durations = DEFAULT_DURATIONS,
  cyclesBeforeLongBreak = CYCLES_BEFORE_LONG_BREAK,
} = {}) {
  const mergedDurations = {
    ...DEFAULT_DURATIONS,
    ...durations,
  };

  return {
    mode: MODES.work,
    status: "idle",
    remainingSeconds: mergedDurations[MODES.work],
    cycleCount: 0,
    durations: mergedDurations,
    cyclesBeforeLongBreak,
  };
}

export function applySettings(state, { durations, cyclesBeforeLongBreak }) {
  const mergedDurations = {
    ...DEFAULT_DURATIONS,
    ...durations,
  };

  return {
    ...state,
    durations: mergedDurations,
    cyclesBeforeLongBreak,
    status: "idle",
    cycleCount: 0,
    remainingSeconds: mergedDurations[state.mode],
  };
}

export function setMode(state, mode) {
  return {
    ...state,
    mode,
    status: "idle",
    remainingSeconds: state.durations[mode],
  };
}

export function startState(state) {
  if (state.status === "running") {
    return state;
  }
  return { ...state, status: "running" };
}

export function pauseState(state) {
  if (state.status !== "running") {
    return state;
  }
  return { ...state, status: "paused" };
}

export function resetState(state) {
  return {
    ...state,
    status: "idle",
    remainingSeconds: state.durations[state.mode],
  };
}

export function tickState(state) {
  if (state.status !== "running") {
    return state;
  }

  const nextRemaining = state.remainingSeconds - 1;

  if (nextRemaining > 0) {
    return {
      ...state,
      remainingSeconds: nextRemaining,
    };
  }

  if (state.mode === MODES.work) {
    const nextCycleCount = state.cycleCount + 1;
    const nextMode =
      nextCycleCount % state.cyclesBeforeLongBreak === 0
        ? MODES.longBreak
        : MODES.shortBreak;

    return {
      ...state,
      mode: nextMode,
      remainingSeconds: state.durations[nextMode],
      cycleCount: nextCycleCount,
      status: "running",
    };
  }

  return {
    ...state,
    mode: MODES.work,
    remainingSeconds: state.durations[MODES.work],
    status: "running",
  };
}

export function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
