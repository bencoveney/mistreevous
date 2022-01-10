# ![logo](https://github.com/nikkorn/mistreevous/raw/master/icons/icon-small.png) Mistreevous
[![npm version](https://badge.fury.io/js/mistreevous.svg)](https://badge.fury.io/js/mistreevous)

A tool to declaratively define and generate behaviour trees in JavaScript. Behaviour trees are used to create complex AI via the modular heirarchical composition of individual tasks.

Using this tool, trees can be defined with a simple and minimal built-in DSL, avoiding the need to write verbose definitions in JSON.

There is an in-browser editor and tree visualiser that you can try [HERE](https://nikkorn.github.io/mistreevous/playground/index.html)

## Install

```sh
$ npm install --save mistreevous
```

# Example
```js
import { State, BehaviourTree } from "mistreevous";

/** Define some behaviour for an agent. */
const definition = `root {
    sequence {
        action [Walk]
        action [Fall]
        action [Laugh]
    }
}`;

/** Create a character that we will be modelling the behaviour for. */
const character = {
    Walk: () => {
        console.log("walking!");
        return State.SUCCEEDED;
    },
    Fall: () => {
        console.log("falling!");
        return State.SUCCEEDED;
    },
    Laugh: () => {
        console.log("laughing!");
        return State.SUCCEEDED;
    },
};

/** Create the behaviour tree, passing our tree definition and the agent that we are modelling behaviour for. */
const behaviourTree = new BehaviourTree(definition, character);

/** Step the tree. */
behaviourTree.step();

// 'walking!'
// 'falling!
// 'laughing!'
```
# Behaviour Tree Methods

#### .isRunning()
Returns `true` if the tree is in the `RUNNING` state, otherwise `false`.

#### .getState()
Gets the current tree state of `SUCCEEDED`, `FAILED` or `RUNNING`.

#### .step()
Carries out a node update that traverses the tree from the root node outwards to any child nodes, skipping those that are already in a resolved state of `SUCCEEDED` or `FAILED`. After being updated, leaf nodes will have a state of `SUCCEEDED`, `FAILED` or `RUNNING`. Leaf nodes that are left in the `RUNNING` state as part of a tree step will be revisited each subsequent step until they move into a resolved state of either `SUCCEEDED` or `FAILED`, after which execution will move through the tree to the next node with a state of `READY`.

Calling this method when the tree is already in a resolved state of `SUCCEEDED` or `FAILED` will cause it to be reset before tree traversal begins.

#### .reset()
Resets the tree from the root node outwards to each nested node, giving each a state of `READY`.


# Nodes

## States
Behaviour tree nodes can be in one of the following states:
- **READY** A node is in a ready state when it has not been visited yet in the execution of the tree.
- **RUNNING** A node is in a running state when it is is still being processed, these nodes will usually represent or encompass a long running action.
- **SUCCEEDED** A node is in a succeeded state when it is no longer being processed and has succeeded.
- **FAILED** A node is in a failed state when it is no longer being processed but has failed.


## Composite Nodes
Composite nodes wrap one or more child nodes, each of which will be processed in a sequence determined by the type of the composite node. A composite node will remain in the running state until it is finished processing the child nodes, after which the state of the composite node will reflect the success or failure of the child nodes.

### Sequence
This composite node will update each child node in sequence. It will succeed if all of its children have succeeded and will fail if any of its children fail. This node will remain in the running state if one of its children is running.

```
root {
    sequence {
        action [Walk]
        action [Fall]
        action [Laugh]
    }
}
```

### Selector
This composite node will update each child node in sequence. It will fail if all of its children have failed and will succeed if any of its children succeed. This node will remain in the running state if one of its children is running.

```
root {
    selector {
        action [TryThis]
        action [ThenTryThis]
        action [TryThisLast]
    }
}
```

### Parallel
This composite node will update each child node concurrently. It will succeed if all of its children have succeeded and will fail if any of its children fail. This node will remain in the running state if any of its children are running.

```
root {
    parallel {
        action [RubBelly]
        action [PatHead]
    }
}
```

### Lotto
This composite node will select a single child at random to run as the active running node. The state of this node will reflect the state of the active child.

```
root {
    lotto {
        action [MoveLeft]
        action [MoveRight]
    }
}
```

## Decorator Nodes
A decorator node is similar to a composite node, but it can only have a single child node. The state of a decorator node is usually some transformation of the state of the child node. Decorator nodes are also used to repeat or terminate execution of a particular node.

### Root
This decorator node represents the root of a behaviour tree and cannot be the child of another composite node.

The state of a root node will reflect the state of its child node.

```
root {
    action [Dance]
}
```

Additional named root nodes can be defined and reused throughout a definition. Other root nodes can be referenced via the **branch** node. Exactly one root node must be left unnamed, this root node will be used as the main root node for the entire tree.

```
root {
    branch [SomeOtherTree]
}

root [SomeOtherTree] {
    action [Dance]
}
```

A probability weight can be defined for each child node as an optional integer node argument, influencing the likelihood that a particular child will be picked.

```
root {
    lotto [10,5,3,1] {
        action [CommonAction]
        action [UncommonAction]
        action [RareAction]
        action [VeryRareAction]
    }
}
```

### Repeat
This decorator node will repeat the execution of its child node if the child moves to the succeeded state. It will do this until either the child fails, at which point the repeat node will fail, or the maximum number of iterations is reached, which moves the repeat node to a succeeded state. This node will be in a running state if its child is also in a running state, or if further iterations need to be made.

The maximum number of iterations can be defined as a single integer node argument. In the example below, we would be repeating the action **SomeAction** 5 times.

```
root {
    repeat [5] {
        action [SomeAction]
    }
}
```
The number of iterations to make can be selected at random within a lower and upper bound if these are defined as two integer node arguments. In the example below, we would be repeating the action **SomeAction** between 1 and 5 times.

```
root {
    repeat [1,5] {
        action [SomeAction]
    }
}
```
The maximum number of iterations to make can be omitted as a node argument. This would result in the child node being run infinitely, as can be seen in the example below.

```
root {
    repeat {
        action [SomeAction]
    }
}
```

### Flip
This decorator node will succeed when its child moves to the failed state, and it will fail if its child moves to the succeeded state. This node will remain in the running state if its children is running.

```
root {
    flip {
        action [SomeAction]
    }
}
```

## Leaf Nodes
Leaf nodes are the lowest level node type and cannot be the parent of other child nodes.

### Action
An action node represents an action that can be completed immediately as part of a single tree step, or ongoing behaviour that can take a prolonged amount of time and may take multiple tree steps to complete. Each action node will correspond to functionality defined within the blackboard, where the first action node argument will be an identifier matching the name of the corresponding blackboard action function.

A blackboard action function can optionally return a finished action state of **succeeded** or **failed**. If the **succeeded** or **failed** state is returned, then the action will move into that state.

```
root {
    action [Attack]
}
```

```js
const board = {
    //...
    Attack: () => {
        // If we do not have a weapon then we cannot attack.
        if (!this.isHoldingWeapon()) {
            // We have failed to carry out an attack!
            return Mistreevous.State.FAILED;
        }

        // ... Attack with swiftness and precision ...

        // We have carried out our attack.
        return Mistreevous.State.SUCCEEDED;
    }
    // ...
};
```

If no value is returned from the action function the action node will move into the **running** state and no following nodes will be processed as part of the current tree step. In the example below, any action node that references **WalkToPosition** will remain in the **running** state until the target position is reached.

```js
const board = {
    //...
    WalkToPosition: () => {
        // ... Walk towards the position we are trying to reach ...

        // Check whether we have finally reached the target position.
        if (this.isAtTargetPosition()) {
            // We have finally reached the target position!
            return Mistreevous.State.SUCCEEDED;
        }
    }
    // ...
};
```

Further steps of the tree will resume processing from leaf nodes that were left in the **running** state until they succeed, fail, or processing of the running branch is aborted via a guard.

#### Promise-based Actions
As well as returning a finished action state from an action function, you can also return a promise that should eventually resolve with a finished state as its value. The action will remain in the running state until the promise is fulfilled, and any following tree steps will not call the action function again.

```js
const board = {
    //...
    SomeAsyncAction: () => {
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                resolve(Mistreevous.State.SUCCEEDED);
            }, 5000);
        });
    }
    // ...
};
```

#### Optional Arguments
Arguments can optionally be passed to blackboard action functions. This is done by including them in the action node argument list in the definition. These optional arguments must be defined after the action name identifier argument, and can be  a `number`, `string`, `boolean` or `null`.

```
root {
    action [Say, "hello world", 5, true]
}
```

```js
const board = {
    //...
    Say: (dialog, times = 1, sayLoudly = false) => 
    {
        for (var index = 0; index < times; index++) {
            showDialog(sayLoudly ? dialog.toUpperCase() + "!!!" : dialog);
        }

        return Mistreevous.State.SUCCEEDED;
    }
    // ...
};
```

### Condition
A Condition node will immediately move into either a **succeeded** or **failed** based of the boolean result of calling a function in the blackboard. Each condition node will correspond to functionality defined within the blackboard, where the first condition node argument will be an identifier matching the name of the corresponding blackboard condition function.

```
root {
    sequence {
        condition [HasWeapon]
        action [Attack]
    }
}
```
```js
const board = {
    //...
    HasWeapon: () => this.isHoldingWeapon(),
    //...
    Attack: () => this.attackPlayer(),
    // ...
};
```

#### Optional Arguments
Arguments can optionally be passed to blackboard condition functions in the same was as action nodes. This is done by including them in the condition node argument list in the definition. These optional arguments must be defined after the condition name identifier argument, and can be a `number`, `string`, `boolean` or `null`.

```
root {
    sequence {
        condition [HasItem, "potion"]
    }
}
```
```js
const board = {
    //...
    HasItem: (itemName) => this.inventory.includes(itemName),
    // ...
};
```

### Wait
A wait node will remain in a running state for a specified duration, after which it will move into the succeeded state. The duration in milliseconds can be defined as a single integer node argument.
```
root {
    repeat {
        sequence {
            action [FireWeapon]
            wait [2000]
        }
    }
}
```
In the above example, we are using a wait node to wait 2 seconds between each run of the **FireWeapon** action.

The duration to wait in milliseconds can also be selected at random within a lower and upper bound if these are defined as two integer node arguments. In the example below, we would run the **PickUpProjectile** action and then wait for 2 to 8 seconds before running the **ThrowProjectile** action.

```
root {
    sequence {
        action [PickUpProjectile]
        wait [2000, 8000]
        action [ThrowProjectile]
    }
}
```

### Branch
Named root nodes can be referenced using the **branch** node. This node acts as a placeholder that will be replaced by the child node of the referenced root node. The two definitions below are synonymous.

```
root {
    branch [SomeOtherTree]
}

root [SomeOtherTree] {
    action [Dance]
}
```

```
root {
    action [Dance]
}
```

## Decorators
Decorators allow additional behaviour to be defined for a tree node. Any number of decorators can be attached to a node as long as there are not multiple decorators of the same type.

Optional arguments can be defined for decorator blackboard functions in the same way as action and condition blackboard functions.

### Entry
An entry decorator defines a blackboard function to call whenever the decorated node moves out of the **ready** state when it is first visited.

```
root {
    sequence entry(StartWalkingAnimation)  {
        action [WalkNorthOneSpace]
        action [WalkEastOneSpace]
        action [WalkSouthOneSpace]
        action [WalkWestOneSpace]
    }
}
```

### Exit
An exit decorator defines a blackboard function to call whenever the decorated node moves to a finished state or is aborted. A results object is passed to the referenced blackboard function containing the **succeeded** and **aborted** boolean properties.

```
root {
    sequence entry(StartWalkingAnimation) exit(StopWalkingAnimation) {
        action [WalkNorthOneSpace]
        action [WalkEastOneSpace]
        action [WalkSouthOneSpace]
        action [WalkWestOneSpace]
    }
}
```

### Step
A step decorator defines a blackboard function to call whenever the decorated node is updated as part of a tree step.

```
root {
    sequence step(OnMoving){
        action [WalkNorthOneSpace]
        action [WalkEastOneSpace]
        action [WalkSouthOneSpace]
        action [WalkWestOneSpace]
    }
}
```

### Guards
A guard decorator defines a condition that must be met in order for the node to remain active. Any running nodes will have their guard condition evaluated for each leaf node update, and will move to a failed state if the guard condition is not met.

This functionality is useful as a means of aborting long running actions or branches that span across multiple steps of the tree.

```
root {
    wait [10000] while(CanWait)
}
```

In the above example, we have a **wait** node that waits for 10 seconds before moving to a succeeded state. We are using a **while** guard to give up on waiting this long if the condition **CanWait** evaluates to false during a tree step.

#### While
A while guard decorator will be satisfied as long as its condition evaluates to true.

```
root {
    sequence while(IsWandering) {
        action [Whistle]
        wait [5000]
        action [Yawn]
        wait [5000]
    }
}
```

#### Until
An until guard decorator will be satisfied as long as its condition evaluates to false.

```
root {
    sequence until(CanSeePlayer) {
        action [LookLeft]
        wait [5000]
        action [LookRight]
        wait [5000]
    }
}
```

## Version History
| Version        | Notes           |
| -------------- |:-------------|
| 2.1.0          | Added optional arguments for actions, conditions and decorators  | 
| 2.0.1          | Fixed isses with inconsistent guard condition evaluation for composite nodes | 
| 2.0.0          | Fixed broken typings | 
| 1.1.0          | Added parallel composite node |
| 1.0.0          | Calls to action, condition and guard blackboard functions are now bound to the blackboard  |
| 0.0.6          | Added promisey actions     |