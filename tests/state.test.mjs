import test from "node:test";
import assert from "node:assert/strict";
import {
  applySettings,
  createInitialState,
  formatTime,
  MODES,
  pauseState,
  resetState,
  setMode,
  startState,
  tickState,
} from "../1.pomodoro/static/js/core/state.js";

test("createInitialState uses defaults", () => {
  const state = createInitialState();
  assert.equal(state.mode, MODES.work);
  assert.equal(state.status, "idle");
  assert.equal(state.remainingSeconds, 25 * 60);
  assert.equal(state.cycleCount, 0);
});

test("startState and pauseState toggle status", () => {
  const initial = createInitialState();
  const running = startState(initial);
  assert.equal(running.status, "running");

  const paused = pauseState(running);
  assert.equal(paused.status, "paused");

  const pausedAgain = pauseState(paused);
  assert.equal(pausedAgain.status, "paused");
});

test("resetState restores remaining time for mode", () => {
  const initial = createInitialState();
  const running = startState(initial);
  const ticked = tickState({ ...running, remainingSeconds: 10 });
  const reset = resetState(ticked);
  assert.equal(reset.remainingSeconds, initial.remainingSeconds);
  assert.equal(reset.status, "idle");
});

test("setMode switches to requested mode and resets", () => {
  const initial = createInitialState();
  const next = setMode(initial, MODES.shortBreak);
  assert.equal(next.mode, MODES.shortBreak);
  assert.equal(next.status, "idle");
  assert.equal(next.remainingSeconds, 5 * 60);
});

test("tickState counts down and auto-switches to break", () => {
  const initial = createInitialState();
  const running = startState(initial);
  const nearEnd = { ...running, remainingSeconds: 1 };
  const switched = tickState(nearEnd);
  assert.equal(switched.mode, MODES.shortBreak);
  assert.equal(switched.status, "running");
  assert.equal(switched.remainingSeconds, 5 * 60);
  assert.equal(switched.cycleCount, 1);
});

test("tickState switches to long break after cycle threshold", () => {
  const initial = createInitialState({ cyclesBeforeLongBreak: 2 });
  const running = startState(initial);

  const firstWorkEnd = tickState({
    ...running,
    remainingSeconds: 1,
  });
  assert.equal(firstWorkEnd.mode, MODES.shortBreak);
  assert.equal(firstWorkEnd.cycleCount, 1);

  const backToWork = setMode(firstWorkEnd, MODES.work);
  const secondWorkEnd = tickState({
    ...backToWork,
    status: "running",
    remainingSeconds: 1,
    cycleCount: 1,
  });
  assert.equal(secondWorkEnd.mode, MODES.longBreak);
  assert.equal(secondWorkEnd.cycleCount, 2);
});

test("tickState switches break back to work", () => {
  const initial = createInitialState();
  const breakState = setMode(initial, MODES.shortBreak);
  const runningBreak = startState(breakState);
  const endBreak = tickState({ ...runningBreak, remainingSeconds: 1 });
  assert.equal(endBreak.mode, MODES.work);
  assert.equal(endBreak.remainingSeconds, 25 * 60);
});

test("applySettings overrides durations and cycles", () => {
  const initial = createInitialState();
  const updated = applySettings(initial, {
    durations: {
      [MODES.work]: 15 * 60,
      [MODES.shortBreak]: 3 * 60,
      [MODES.longBreak]: 10 * 60,
    },
    cyclesBeforeLongBreak: 3,
  });

  assert.equal(updated.durations[MODES.work], 15 * 60);
  assert.equal(updated.durations[MODES.shortBreak], 3 * 60);
  assert.equal(updated.durations[MODES.longBreak], 10 * 60);
  assert.equal(updated.cyclesBeforeLongBreak, 3);
  assert.equal(updated.remainingSeconds, 15 * 60);
});

test("formatTime formats minutes and seconds", () => {
  assert.equal(formatTime(0), "00:00");
  assert.equal(formatTime(65), "01:05");
  assert.equal(formatTime(600), "10:00");
});
