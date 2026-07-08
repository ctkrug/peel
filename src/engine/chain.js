import { applyOperation } from "./registry.js";

/**
 * Runs a sequence of operation ids over a starting string, stopping (without
 * throwing) at the first operation that fails to apply — a wrong guess in the
 * game is a dead end, not a crash.
 */
export function runChain(startingText, operationIds) {
  const steps = [{ operationId: null, text: startingText, ok: true }];
  let current = startingText;

  for (const operationId of operationIds) {
    try {
      current = applyOperation(operationId, current);
      steps.push({ operationId, text: current, ok: true });
    } catch (error) {
      steps.push({ operationId, text: null, ok: false, error: error.message });
      break;
    }
  }

  return steps;
}

export function chainReachesTarget(startingText, operationIds, target) {
  const steps = runChain(startingText, operationIds);
  const last = steps[steps.length - 1];
  return last.ok && last.text === target;
}
