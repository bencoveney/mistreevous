/**
 * Enumeration of node state types.
 */
declare const State: {
    READY: symbol;
    RUNNING: symbol;
    SUCCEEDED: symbol;
    FAILED: symbol;
};
export { State as default };
export type CompleteState = typeof State.SUCCEEDED | typeof State.FAILED;
export type AnyState = typeof State.READY | typeof State.RUNNING | CompleteState;
