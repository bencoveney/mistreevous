import Guard from "./guard";
import Lookup from "../../lookup";
import { Agent } from "../../agent";

/**
 * A WHILE guard which is satisfied as long as the given condition remains true.
 */
export default class While extends Guard {
    /**
     * @param condition The name of the condition function that determines whether the guard is satisfied.
     * @param args The array of decorator argument definitions.
     */
    constructor(private condition: string, args: any[]) {
        super("while", args);
    }

    /**
     * Gets the condition of the guard.
     */
    getCondition = () => this.condition;

    /**
     * Gets the decorator details.
     */
    getDetails = () => {
        return {
            type: this.getType(),
            isGuard: this.isGuard(),
            condition: this.getCondition(),
            arguments: this.getArguments()
        };
    };

    /**
     * Gets whether the guard is satisfied.
     * @param agent The agent.
     * @returns Whether the guard is satisfied.
     */
    isSatisfied = (agent: Agent) => {
        // Attempt to get the invoker for the condition function.
        const conditionFuncInvoker = Lookup.getFuncInvoker(agent, this.condition);

        // The condition function should be defined.
        if (conditionFuncInvoker === null) {
            throw new Error(
                `cannot evaluate node guard as the condition '${this.condition}' function is not defined on the agent and has not been registered`
            );
        }

        // Call the condition function to determine whether this guard is satisfied.
        return !!conditionFuncInvoker(this.args);
    };
}
