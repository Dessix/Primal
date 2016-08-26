// tslint:disable-next-line: class-name
interface global {
    kernel: {
        spawnProcessByClassName(processName: string, parentPid?: number): ProcessId | undefined;
    };
    reboot(): void;
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

declare interface CreepMemory {
    role: string;
    [key: string]: any;
}
