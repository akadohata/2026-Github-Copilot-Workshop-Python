const SETTINGS_KEY = "pomodoroSettings";
const LOGS_KEY = "pomodoroLogs";

export function loadSettings() {
  const raw = window.localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSettings(settings) {
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadLogs() {
  const raw = window.localStorage.getItem(LOGS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLogs(logs) {
  window.localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}
