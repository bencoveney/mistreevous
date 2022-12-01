import Node from "../node";
import Decorator from "./decorator";
import State from "../../state";
import { Agent } from "../../agent";
import Attribute from "../../attributes/attribute";

/**
 * A Fail node.
 * This node wraps a single child and will always move to the 'FAILED' state when the child moves to a 'SUCCEEDED' or 'FAILED' state.
 */
export default class Fail extends Decorator {
    /**
     * @param attributes The node attributes.
     * @param child The child node.
     */
    constructor(attributes: Attribute[] | null, child: Node) {
        super("fail", attributes, child);
    }

    /**
     * Update the node.
     * @param agent The agent.
     * @returns The result of the update.
     */
    onUpdate = (agent: Agent) => {
        // If the child has never been updated or is running then we will need to update it now.
        if (this.child.getState() === State.READY || this.child.getState() === State.RUNNING) {
            this.child.update(agent);
        }

        // The state of this node will depend in the state of its child.
        switch (this.child.getState()) {
            case State.RUNNING:
                this.setState(State.RUNNING);
                break;

            case State.SUCCEEDED:
            case State.FAILED:
                this.setState(State.FAILED);
                break;

            default:
                this.setState(State.READY);
        }
    };

    /**
     * Gets the name of the node.
     */
    getName = () => "FAIL";
}
