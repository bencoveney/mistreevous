/**
 * A WHILE node.
 * The node has a single child which will have a condition function that determines whether to repeat the update of the child node.
 * The WHILE node will stop and have a 'FAILED' state if its child is ever in a 'FAILED' state after an update.
 * The WHILE node will attempt to move on to the next iteration if its child is ever in a 'SUCCEEDED' state.
 * @param uid The unique node it.
 * @param conditionFunction The name of the condition function that determines whether to repeat the update of the child node.
 * @param child The child node. 
 */
export default function While(uid, conditionFunction, child) {
    /**
     * The node state.
     */
    let state = Mistreevous.State.READY;

    /**
     * Update the node and get whether the node state has changed.
     * @param board The board.
     * @returns Whether the state of this node has changed as part of the update.
     */
    this.update = function(board) {
        // Get the pre-update node state.
        const initialState = state;

        // If this node is already in a 'SUCCEEDED' or 'FAILED' state then there is nothing to do.
        if (state === Mistreevous.State.SUCCEEDED || state === Mistreevous.State.FAILED) {
            // We have not changed state.
            return false;
        }

        // If this node is in the READY state then we need to reset the iteration count and determine which method we will use as a repeat condition.
        if (state === Mistreevous.State.READY) {
            // Reset the child node.
            child.reset();

            // Do an initial check to see if we can iterate. If we can then this node will be in the 'RUNNING' state.
            // If we cannot iterate then we have immediately failed our condition or hit our target iteration count, then the node has succeeded.
            if (this._canIterate(board)) {
                // This node is in the running state and can do its initial iteration.
                state = Mistreevous.State.RUNNING;
            } else {
                // This node is in the 'SUCCEEDED' state.
                state = Mistreevous.State.SUCCEEDED;

                // Return whether the state of this node has changed.
                return state !== initialState;
            }
        }

        do {
            // Reset the child node if it is already in the 'SUCCEEDED' state.
            if (child.getState() === Mistreevous.State.SUCCEEDED) {
                child.reset();
            } 

            // If the child has never been updated or is running then we will need to update it now.
            if (child.getState() === Mistreevous.State.READY || child.getState() === Mistreevous.State.RUNNING) {
                child.update(board);
            }

            // If the child node is in the 'SUCCEEDED' state then we may be moving on to the next iteration or setting this 
            // node as 'SUCCEEDED' if we cant. If this node is in the 'FAILED' state then this node has completely failed.
            if (child.getState() === Mistreevous.State.SUCCEEDED) {
                // The child node has reached the 'SUCCEEDED' state, so we have completed an iteration.
            } else if (child.getState() === Mistreevous.State.FAILED) {
                // The has failed, meaning that this node has failed.
                state = Mistreevous.State.FAILED;

                // Return whether the state of this node has changed.
                return state !== initialState;
            } else if (child.getState() === Mistreevous.State.RUNNING) {
                // This node is in the running state as its child is in the running state.
                state = Mistreevous.State.RUNNING;

                // Return whether the state of this node has changed.
                return state !== initialState;
            }
        } while (this._canIterate(board));

        // If we were able to complete our iterations without our child going into the 'FAILED' state then this node has succeeded.
        state = Mistreevous.State.SUCCEEDED;

        // Return whether the state of this node has changed.
        return state !== initialState;
    };

    /**
     * Gets the state of the node.
     */
    this.getState = () => state;

    /**
     * Gets the name of the node.
     */
    this.getName = () => `WHILE ${conditionFunction}`;

    /**
     * Gets the state of the node.
     */
    this.getChildren = () => [child];

    /**
     * Gets the type of the node.
     */
    this.getType = () => "while";

    /**
     * Gets the unique id of the node.
     */
    this.getUid = () => uid;

    /**
     * Reset the state of the node.
     */
    this.reset = () => {
        // Reset the state of this node.
        state = Mistreevous.State.READY;

        // Reset the child node.
        child.reset();
    };

    /**
     * Gets whether an iteration can be made.
     * @param board The board.
     * @returns Whether an iteration can be made.
     */
    this._canIterate = (board) => {
        // Call the condition function to determine whether we can iterate.
        if (typeof board[conditionFunction] === "function") {
            return !!(board[conditionFunction]());
        } else {
            throw `cannot update repeat node as condition function '${conditionFunction}' is not defined in the blackboard`;
        }
    };
};