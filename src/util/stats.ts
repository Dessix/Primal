import { Kernel } from "./../kernel/kernel";
interface StatsRecord {
    [key: string]: any;
}
interface StatsMemory extends Memory {
    stats: StatsRecord;
}
declare const global: { kernel: Kernel; };
declare const RawMemory: RawMemory;

export function recordStats(initialCpuOverhead: number, memoryInitializationTime: number) {
    const stats = <StatsRecord>{};
    const rooms = Game.rooms;
    const spawns = Game.spawns;
    for (let roomKey in rooms) {
        const room = Game.rooms[roomKey];
        const isMyRoom = (room.controller ? room.controller.my : 0);
        if (isMyRoom) {
            stats[`room.${room.name}.myRoom`] = 1;
            stats[`room.${room.name}.energyAvailable`] = room.energyAvailable;
            stats[`room.${room.name}.energyCapacityAvailable`] = room.energyCapacityAvailable;
            if (room.controller !== undefined) {
                stats[`room.${room.name}.controllerProgress`] = room.controller.progress;
                stats[`room.${room.name}.controllerProgressTotal`] = room.controller.progressTotal;
            }
            let stored = 0;
            let storedCapacity = 0;

            if (room.storage) {
                const store = room.storage.store;
                stored = store[RESOURCE_ENERGY] || 0;
                storedCapacity = room.storage.storeCapacity || 0;
                for (let resName in store) {
                    stats[`room.${room.name}.resources.${resName}`] = store[resName];
                }
            }
            stats[`room.${room.name}.storedEnergy`] = stored;
        } else {
            stats[`room.${room.name}.myRoom`] = undefined;
        }
    }
    stats["gcl.progress"] = Game.gcl.progress;
    stats["gcl.progressTotal"] = Game.gcl.progressTotal;
    stats["gcl.level"] = Game.gcl.level;
    for (let spawnKey in spawns) {
        let spawn = spawns[spawnKey];
        stats[`spawn.${spawn.name}.defenderIndex`] = spawn.memory["defenderIndex"];
    }

    stats["cpu.bucket"] = Game.cpu.bucket;
    stats["cpu.limit"] = Game.cpu.limit;
    const used = Game.cpu.getUsed();
    //stats["cpu.stats"] = used - lastTick;
    stats["cpu.getUsed"] = used;
    stats["memory.usage"] = RawMemory.get().length;
    stats["processCount"] = global.kernel.getProcessCount();
    stats["cpu.memoryDeserializationTime"] = memoryInitializationTime;
    stats["cpu.initialOverhead"] = initialCpuOverhead;

    (<StatsMemory>Memory).stats = stats;
}
