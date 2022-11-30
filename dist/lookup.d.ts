export type Arg = {
    value: any;
};
export type Args = Arg[];
export type InvokerFunction<T> = (args: Args) => T;
/**
 * A singleton used to store and lookup registered functions and subtrees.
 */
export default class Lookup {
    /**
     * The object holding any registered functions keyed on function name.
     */
    private static functionTable;
    /**
     * The object holding any registered sub-trees keyed on tree name.
     */
    private static subtreeTable;
    /**
     * Gets the function with the specified name.
     * @param name The name of the function.
     * @returns The function with the specified name.
     */
    static getFunc(name: string): Function;
    /**
     * Sets the function with the specified name for later lookup.
     * @param name The name of the function.
     * @param func The function.
     */
    static setFunc(name: string, func: Function): void;
    /**
     * Gets the function invoker for the specified agent and function name.
     * If a function with the specified name exists on the agent object then it will
     * be returned, otherwise we will then check the registered functions for a match.
     * @param agent The agent instance that this behaviour tree is modelling behaviour for.
     * @param name The function name.
     * @returns The function invoker for the specified agent and function name.
     */
    static getFuncInvoker<T>(agent: any, name: string): InvokerFunction<T> | null;
    /**
     * Gets the subtree with the specified name.
     * @param name The name of the subtree.
     * @returns The subtree with the specified name.
     */
    static getSubtree(name: string): any;
    /**
     * Sets the subtree with the specified name for later lookup.
     * @param name The name of the subtree.
     * @param subtree The subtree.
     */
    static setSubtree(name: string, subtree: any): void;
    /**
     * Removes the registered function or subtree with the specified name.
     * @param name The name of the registered function or subtree.
     */
    static remove(name: string): void;
    /**
     * Remove all registered functions and subtrees.
     */
    static empty(): void;
}
