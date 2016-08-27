export declare class ScreepsStats {
    private username;
    constructor();
    clean(): void;
    addStat(key: string, value: any): void;
    runBuiltinStats(): void;
    roomExpensive(stats: TickStat, room: Room): void;
    removeTick(tick: number | number[]): string;
    getStats(json: boolean): string | {
        [tick: number]: TickStat;
    };
    getStatsForTick(tick: number): TickStat;
}
export declare class TickStat {
    cpu: any;
    gcl: any;
    minerals: {
        [id: string]: any;
    };
    rooms: {
        [roomName: string]: any;
    };
    spawns: {
        [roomName: string]: any;
    };
    sources: {
        [id: string]: any;
    };
    storage: {
        [id: string]: any;
    };
    terminal: {
        [id: string]: any;
    };
    tick: number;
    time: string;
}
