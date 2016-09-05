
interface Volatile {
    [key: string]: any;
}

interface Global {
    [key: string]: any;
    kernel: {
        spawnProcessByClassName(processName: string, parentPid?: number): ProcessId | undefined;
    };
    k: {
        spawnProcessByClassName(processName: string, parentPid?: number): ProcessId | undefined;
    };
    launchNew(className: string): number | undefined;
    reset(): void;
    config: CoreConfiguration;
    c: { [creepName: string]: Creep | undefined };
    s: { [spawnName: string]: Spawn | undefined };
    f: { [flagName: string]: Flag | undefined };
    id: (id: string) => RoomObject | null;
    sinspect: (val: any) => string;
    inspect: (val: any) => void;

    /** 
     * Resets every reinitialization 
     */
    volatile: Volatile;

    /**
     * Resets once at the beginning of each tick
     */
    tickVolatile: Volatile;
}

declare var global: Global;

type CreepBodyPart = "move" | "work" | "carry" | "attack" | "ranged_attack" | "tough" | "heal" | "claim";

interface CoreConfiguration {
    noisy: boolean;
    profile: boolean;
    minersRepair: boolean;
    builderMultiplier: number;
    upgraderMultiplier: number;
    repairerMultiplier: number;
    courierMultiplier: number;
}

interface Memory {
    config: CoreConfiguration;

    /**
     * Does not reset, but is not guaranteed to survive
     */
    involatile: Volatile;
    sources: { [roomName: string]: { sourceInfo: SourceScanInfo } | undefined }
}

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

interface SourceInfo {
    id: string;
    position: {
        x: number;
        y: number;
    };
    miningPosition: {
        x: number;
        y: number;
    };
}

interface SourceScanInfo {
    roomName: string;
    sources: Array<SourceInfo>;
    lastSourceIndex: number;
}
