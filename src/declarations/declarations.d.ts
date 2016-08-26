// tslint:disable-next-line: class-name
interface global {
    debug: any;
    logdump: any;
    warnMode: any;
    infoMode: any;
    debugMode: any;
    traceMode: any;
    [key: string]: any;
}

declare var global: global;

type CreepBodyPart = "move" | "work" | "carry" | "attack" | "ranged_attack" | "tough" | "heal" | "claim";

declare const enum Direction {
    TOP = 1,
    TOP_RIGHT = 2,
    RIGHT = 3,
    BOTTOM_RIGHT = 4,
    BOTTOM = 5,
    BOTTOM_LEFT = 6,
    LEFT = 7,
    TOP_LEFT = 8,
}
