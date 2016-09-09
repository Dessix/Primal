import { BaseRole } from "./baseRole";

export interface StateHandler<TMemory extends CreepMemory, TStateValue extends number | string> {
    (creep: Creep, cmem: TMemory): TStateValue | undefined;
}

export interface StateHandlerList<TMemory extends CreepMemory, TStateValue extends number | string> {
    [stateValue: string]: StateHandler<TMemory, TStateValue>;
    [stateValueNum: number]: StateHandler<TMemory, TStateValue>;
}

export abstract class FsmRole<TMemory extends CreepMemory, TStateValue extends string | number> extends BaseRole<TMemory> {
    public static readonly StateTransitionsCap = 15;

    private readonly _setState: (memory: TMemory, value: TStateValue) => void;
    private readonly _getState: (memory: TMemory) => TStateValue | undefined;
    public readonly _defaultState: TStateValue;

    constructor(
        defaultState: TStateValue,
        setState: (this: void, memory: TMemory, value: TStateValue) => void,
        getState: (this: void, memory: TMemory) => TStateValue | undefined
    ) {
        super();
        this._setState = setState;
        this._getState = getState;
        this._defaultState = defaultState;
    }

    /**
     * Called just before a new state is assigned, if the state has changed
     */
    protected onTransition?(creep: Creep, cmem: TMemory, oldState: TStateValue | undefined, newState: TStateValue): void;

    protected abstract runState(state: TStateValue, creep: Creep, cmem: TMemory): TStateValue | undefined;

    private static StateTransitionTracker = new Array<string | number>(FsmRole.StateTransitionsCap);

    protected onRun(creep: Creep): void {
        const cmem = <TMemory>creep.memory;

        let currentState = this._getState(cmem);
        const onTransition = this.onTransition;

        //Default state does not count as a transition
        if (currentState === undefined) {
            this._setState(cmem, currentState = this._defaultState);
        }

        const transitionCap = FsmRole.StateTransitionsCap;
        const transitionTracker = FsmRole.StateTransitionTracker;
        transitionTracker[0] = currentState;

        let transitionCount = 0;
        let newState: TStateValue | undefined;
        while ((newState = this.runState(currentState, creep, cmem)) !== undefined) {
            ++transitionCount;
            transitionTracker[transitionCount] = newState;
            if (transitionCount === transitionCap) {
                console.log(`Role ${creep.role} Exceeded state transitions per execution! Transition chain:\n${transitionTracker.slice(0, transitionCount).join(",")}`);
                break;
            }
            if (currentState !== newState) {
                if (onTransition !== undefined) { onTransition(creep, cmem, currentState, newState); }
                this._setState(cmem, newState);
                currentState = newState;
            }
        }
    }
}
