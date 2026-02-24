import test from "node:test";
import assert from "node:assert/strict";
import { createIntervalTimer } from "../1.pomodoro/static/js/core/timer.js";

test("createIntervalTimer start/stop toggles running", async () => {
  globalThis.window = globalThis;

  let tickCount = 0;
  const timer = createIntervalTimer(() => {
    tickCount += 1;
  }, 5);

  assert.equal(timer.isRunning(), false);
  timer.start();
  assert.equal(timer.isRunning(), true);

  await new Promise((resolve) => setTimeout(resolve, 20));
  timer.stop();
  assert.equal(timer.isRunning(), false);

  const observed = tickCount;
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(tickCount, observed);
});

