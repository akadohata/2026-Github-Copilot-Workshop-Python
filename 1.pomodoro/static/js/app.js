import {
  createInitialState,
  CYCLES_BEFORE_LONG_BREAK,
  DEFAULT_DURATIONS,
  formatTime,
  MODES,
  applySettings,
  pauseState,
  resetState,
  setMode,
  startState,
  tickState,
} from "./core/state.js";
import { createIntervalTimer } from "./core/timer.js";
import { loadLogs, loadSettings, saveLogs, saveSettings } from "./adapters/storage.js";

const display = document.querySelector("#timer-display");
const startButton = document.querySelector("#start-button");
const pauseButton = document.querySelector("#pause-button");
const resetButton = document.querySelector("#reset-button");
const modeButtons = Array.from(document.querySelectorAll(".mode-button"));
const workMinutesInput = document.querySelector("#work-minutes");
const shortBreakMinutesInput = document.querySelector("#short-break-minutes");
const longBreakMinutesInput = document.querySelector("#long-break-minutes");
const cycleCountInput = document.querySelector("#cycle-count");
const applySettingsButton = document.querySelector("#apply-settings");
const weeklyTotal = document.querySelector("#weekly-total");
const weeklyCount = document.querySelector("#weekly-count");
const monthlyTotal = document.querySelector("#monthly-total");
const monthlyCount = document.querySelector("#monthly-count");
const recentSessions = document.querySelector("#recent-sessions");

const storedSettings = loadSettings();
let state = createInitialState(storedSettings ?? undefined);
let logs = loadLogs();

const timer = createIntervalTimer(() => {
  const previousState = state;
  state = tickState(state);
  if (
    previousState.mode === MODES.work &&
    previousState.status === "running" &&
    previousState.remainingSeconds === 1
  ) {
    logSession(previousState.durations[MODES.work]);
  }
  if (previousState.status === "running" && previousState.remainingSeconds === 1) {
    playChime();
  }
  render(state);
  if (state.status !== "running") {
    timer.stop();
  }
});

function render(nextState) {
  display.textContent = formatTime(nextState.remainingSeconds);

  modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === nextState.mode;
    button.classList.toggle("is-active", isActive);
  });

  startButton.disabled = nextState.status === "running";
  pauseButton.disabled = nextState.status !== "running";
}

function syncSettingsForm(nextState) {
  workMinutesInput.value = Math.round(nextState.durations[MODES.work] / 60);
  shortBreakMinutesInput.value = Math.round(
    nextState.durations[MODES.shortBreak] / 60
  );
  longBreakMinutesInput.value = Math.round(
    nextState.durations[MODES.longBreak] / 60
  );
  cycleCountInput.value = nextState.cyclesBeforeLongBreak;
}

function parseMinutes(value, fallbackSeconds) {
  const minutes = Number.parseInt(value, 10);
  if (Number.isNaN(minutes) || minutes <= 0) {
    return fallbackSeconds;
  }
  return minutes * 60;
}

function parseCount(value, fallback) {
  const count = Number.parseInt(value, 10);
  if (Number.isNaN(count) || count <= 0) {
    return fallback;
  }
  return count;
}

function handleStart() {
  state = startState(state);
  render(state);
  timer.start();
}

function handlePause() {
  state = pauseState(state);
  render(state);
  timer.stop();
}

function handleReset() {
  state = resetState(state);
  render(state);
  timer.stop();
}

function handleModeSwitch(mode) {
  state = setMode(state, mode);
  render(state);
  timer.stop();
}

function handleApplySettings() {
  const durations = {
    [MODES.work]: parseMinutes(
      workMinutesInput.value,
      DEFAULT_DURATIONS[MODES.work]
    ),
    [MODES.shortBreak]: parseMinutes(
      shortBreakMinutesInput.value,
      DEFAULT_DURATIONS[MODES.shortBreak]
    ),
    [MODES.longBreak]: parseMinutes(
      longBreakMinutesInput.value,
      DEFAULT_DURATIONS[MODES.longBreak]
    ),
  };

  const cyclesBeforeLongBreak = parseCount(
    cycleCountInput.value,
    CYCLES_BEFORE_LONG_BREAK
  );

  const settings = { durations, cyclesBeforeLongBreak };

  state = applySettings(state, settings);
  saveSettings(settings);
  render(state);
  syncSettingsForm(state);
  timer.stop();
}

function logSession(durationSeconds) {
  const entry = {
    durationSeconds,
    endedAt: new Date().toISOString(),
  };

  logs = [entry, ...logs].slice(0, 200);
  saveLogs(logs);
  updateDashboard();
}

function updateDashboard() {
  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const weeklyLogs = logs.filter((log) =>
    isOnOrAfter(new Date(log.endedAt), startOfWeek)
  );
  const monthlyLogs = logs.filter((log) =>
    isOnOrAfter(new Date(log.endedAt), startOfMonth)
  );

  const weeklySeconds = sumSeconds(weeklyLogs);
  const monthlySeconds = sumSeconds(monthlyLogs);

  weeklyTotal.textContent = formatDuration(weeklySeconds);
  weeklyCount.textContent = formatCount(weeklyLogs.length);
  monthlyTotal.textContent = formatDuration(monthlySeconds);
  monthlyCount.textContent = formatCount(monthlyLogs.length);

  recentSessions.innerHTML = "";
  logs.slice(0, 5).forEach((log) => {
    const item = document.createElement("li");
    const endedAt = new Date(log.endedAt);
    item.textContent = `${formatDuration(log.durationSeconds)} · ${endedAt.toLocaleString()}`;
    recentSessions.appendChild(item);
  });
}

function playChime() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 880;
  gain.gain.value = 0.0001;

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(0.2, audioContext.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.4);
  oscillator.stop(audioContext.currentTime + 0.5);
}

function sumSeconds(entries) {
  return entries.reduce((total, entry) => total + entry.durationSeconds, 0);
}

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function formatCount(count) {
  return `${count} session${count === 1 ? "" : "s"}`;
}

function getStartOfWeek(date) {
  const day = date.getDay();
  const offset = (day + 6) % 7;
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - offset);
  return start;
}

function isOnOrAfter(value, threshold) {
  return value.getTime() >= threshold.getTime();
}

startButton.addEventListener("click", handleStart);
pauseButton.addEventListener("click", handlePause);
resetButton.addEventListener("click", handleReset);
modeButtons.forEach((button) => {
  button.addEventListener("click", () => handleModeSwitch(button.dataset.mode));
});
applySettingsButton.addEventListener("click", handleApplySettings);

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "s") {
    handleStart();
    return;
  }

  if (key === "i") {
    handlePause();
    return;
  }

  if (key === "e") {
    handleReset();
  }
});

render(state);
syncSettingsForm(state);
updateDashboard();
