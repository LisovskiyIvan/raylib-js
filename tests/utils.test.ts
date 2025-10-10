import { test, expect } from "bun:test";
import { collectResults, sequence, retry, logResult } from "../src/utils";
import { ok, err } from "../src/result";
import { validationError } from "../src/types";

test("collectResults - should collect all successful results", () => {
  const results = [
    ok(1),
    ok(2),
    ok(3)
  ];
  
  const collected = collectResults(results);
  
  expect(collected.isOk()).toBe(true);
  if (collected.isOk()) {
    expect(collected.value).toEqual([1, 2, 3]);
  }
});

test("collectResults - should return first error", () => {
  const error = validationError("test error");
  const results = [
    ok(1),
    err(error),
    ok(3)
  ];
  
  const collected = collectResults(results);
  
  expect(collected.isErr()).toBe(true);
  if (collected.isErr()) {
    expect(collected.error).toBe(error);
  }
});

test("sequence - should execute operations in sequence", () => {
  let counter = 0;
  const operations = [
    () => ok(++counter),
    () => ok(++counter),
    () => ok(++counter)
  ];
  
  const result = sequence(operations);
  
  expect(result.isOk()).toBe(true);
  if (result.isOk()) {
    expect(result.value).toEqual([1, 2, 3]);
  }
});

test("sequence - should stop on first error", () => {
  let counter = 0;
  const error = validationError("test error");
  const operations = [
    () => ok(++counter),
    () => err(error),
    () => ok(++counter) // This should not execute
  ];
  
  const result = sequence(operations);
  
  expect(result.isErr()).toBe(true);
  expect(counter).toBe(1); // Only first operation executed
  if (result.isErr()) {
    expect(result.error).toBe(error);
  }
});

test("retry - should return success on first try", () => {
  const operation = () => ok("success");
  
  const result = retry(operation, 3);
  
  expect(result.isOk()).toBe(true);
  if (result.isOk()) {
    expect(result.value).toBe("success");
  }
});

test("retry - should not retry validation errors", () => {
  let attempts = 0;
  const error = validationError("validation failed");
  const operation = () => {
    attempts++;
    return err(error);
  };
  
  const result = retry(operation, 3);
  
  expect(result.isErr()).toBe(true);
  expect(attempts).toBe(1); // Should not retry
  if (result.isErr()) {
    expect(result.error).toBe(error);
  }
});

test("logResult - should return same result for success", () => {
  const result = ok("test value");
  const logged = logResult(result, "test operation");
  
  expect(logged.isOk()).toBe(true);
  if (logged.isOk()) {
    expect(logged.value).toBe("test value");
  }
});

test("logResult - should return same result for error", () => {
  const error = validationError("test error", "test context");
  const result = err(error);
  const logged = logResult(result, "test operation");
  
  expect(logged.isErr()).toBe(true);
  if (logged.isErr()) {
    expect(logged.error).toBe(error);
  }
});