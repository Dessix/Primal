
/// <reference path="../typings/globals/screeps/index.d.ts" />
type AstarDefaults = {
    'diagonal': boolean,
    'heuristic': string,
    'closest': boolean,
    'weight': boolean,
    'heuristicModifier': number,
    'avoid': any[],
    'ignore': any[],
    'maxops': boolean,
    'scoring': {
        'avoid': boolean,
        'ignore': boolean,
        'creep': number,
        'terrain': {
            'swamp': number,
            'plain': number,
            'wall': number,
        },
        'structures': {
            'default': number,
            'road': number,
            'constructedWall': number,
            'hostile_rampart': number,
            'rampart': boolean
        },
        'filter': boolean,
        'distancepenalty': number,
        'directionchange': number,
    }
};

declare class GridNode {
    constructor(room: Room, x: number, y: number, weight?: number);
    x: number;
    y: number;
    f: number;
    g: number;
    h: number;
    visited: boolean;
    closed: boolean;
    parent: any;//Not sure what this is

    isBlocked(): boolean;
    getDirectionFrom(node: GridNode): number;
    toString(): string;
}

declare class BinaryHeap<T> {
    constructor(scoreFunction: Function);
    push(element: T): void;
    pop(): T;
    remove(node: T): void;
    size(): number;
    rescoreElement(node: T): void;
    sinkDown(n: number): void;
    bubbleUp(n: number): void;
}

declare class Graph {
    constructor(room: Room, weight: Function, scoring: number, diagonal: boolean);
    getNode(x: number, y: number): GridNode
}

type HeuristicFunction = (pos0: GridNode, pos1: GridNode) => number;
declare class Astar {
    static display: boolean;
    static colors: {
        optimal: any,
        tested: any,
    };
    static defaults: AstarDefaults;
    heuristics: {
        manhattan: HeuristicFunction;
        diagonal_weighted: HeuristicFunction;
        diagonal: HeuristicFunction;
        [heuristicName: string]: HeuristicFunction;
    }
    search(room: Room, start: GridNode, end: GridNode, user_options: AstarDefaults): void;
    scoring(
        room: Room,
        x: number,
        y: number,
        scoring: {
            filter: any,
            structure: boolean,
            creep: boolean
        }): number;
    pathTo(room: Room, node: GridNode): any[];
}

export = Astar;
