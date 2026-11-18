import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateLateness,
  confirmedConnectedMinutes,
  toCsv,
} from "./attendance.ts";

test("calculates raw and grace-adjusted lateness", () => {
  assert.deepEqual(
    calculateLateness("2026-11-18T18:00:00Z", "2026-11-18T18:07:00Z", 10),
    { rawMinutes: 7, countedMinutes: 0 },
  );
  assert.deepEqual(
    calculateLateness("2026-11-18T18:00:00Z", "2026-11-18T18:15:00Z", 10),
    { rawMinutes: 15, countedMinutes: 5 },
  );
  assert.deepEqual(
    calculateLateness("2026-11-18T18:00:00Z", "2026-11-18T17:55:00Z", 0),
    { rawMinutes: 0, countedMinutes: 0 },
  );
  assert.deepEqual(calculateLateness("2026-11-18T18:00:00Z", null, 10), {
    rawMinutes: 0,
    countedMinutes: 0,
  });
});

test("merges overlapping intervals without counting duplicates", () => {
  assert.equal(
    confirmedConnectedMinutes([
      { start: "2026-11-18T18:00:00Z", end: "2026-11-18T18:20:00Z" },
      { start: "2026-11-18T18:10:00Z", end: "2026-11-18T18:30:00Z" },
      { start: "2026-11-18T18:05:00Z", end: "2026-11-18T18:15:00Z" },
    ]),
    30,
  );
});

test("does not count disconnected gaps and supports empty intervals", () => {
  assert.equal(
    confirmedConnectedMinutes([
      { start: "2026-11-18T18:00:00Z", end: "2026-11-18T18:10:00Z" },
      { start: "2026-11-18T18:20:00Z", end: "2026-11-18T18:35:00Z" },
    ]),
    25,
  );
  assert.equal(confirmedConnectedMinutes([]), 0);
});

test("rejects invalid timestamps, negative grace, and reversed intervals", () => {
  assert.throws(
    () => calculateLateness("2026-02-30T18:00:00Z", null, 0),
    RangeError,
  );
  assert.throws(
    () => calculateLateness("2026-11-18T18:00:00Z", "not a time", 0),
    RangeError,
  );
  assert.throws(
    () => calculateLateness("2026-11-18T18:00:00Z", null, -1),
    RangeError,
  );
  assert.throws(
    () =>
      confirmedConnectedMinutes([
        { start: "2026-11-18T18:10:00Z", end: "2026-11-18T18:00:00Z" },
      ]),
    RangeError,
  );
});

test("quotes CSV cells and neutralizes formula-like strings", () => {
  assert.equal(
    toCsv([
      ["Name", "Note", "Count"],
      ["A, B", 'She said "hello"', 3],
      ["=1+1", " \t@SUM(A1:A2)", "-2+3"],
    ]),
    '"Name","Note","Count"\r\n"A, B","She said ""hello""","3"\r\n"\'=1+1","\' \t@SUM(A1:A2)","\'-2+3"',
  );
});
