import { Process, ProcessStatus } from "../kernel/process";

type ID<T extends Structure> = string;
type LinkId = ID<Link>;

interface LinksMemory extends ProcessMemory {
}

interface LinkRoomMemory {
    nextLinkScanTick?: number;
    storageLinkId?: LinkId;
    miningLinkIds?: LinkId[];
}

export class PLinks extends Process {
    public static className: string = "Links";
    public get className(): string { return PLinks.className; }
    public readonly LinkScanTickrate: number = 50;
    public readonly baseHeat: number = 7;
    private pmem: LinksMemory;

    public constructor(pid: ProcessId, parentPid: ProcessId) {
        super(pid, parentPid);
    }

    private rescanRoom(room: Room, rmem: LinkRoomMemory) {
        const storageLink = fromId<StructureLink>(rmem.storageLinkId);
        //if (rmem.storageLinkId === nul
    }

    public run(): ProcessMemory | undefined {
        const pmem = this.pmem;
        const gTime = Game.time;
        for (let roomName in Game.rooms) {
            const room = Game.rooms[roomName];
            const rmem = <LinkRoomMemory>(room.memory || (room.memory = {}));
            if (rmem.nextLinkScanTick === undefined || gTime >= rmem.nextLinkScanTick) {
                this.rescanRoom(room, rmem);
            }
        }

        // if (pmem.nextTowerScanTick === undefined || gTime >= pmem.nextTowerScanTick) {
        //     const towers = pmem.towers;
        //     const structures = Game.structures;
        //     for (let structureName in structures) {
        //         const structure = structures[structureName];
        //         if (structure.structureType !== STRUCTURE_TOWER || !(<StructureTower>structure).my) { continue; }
        //         const tower = <StructureTower>structure;
        //         const towerId = tower.id;
        //         if (towers.indexOf(towerId) >= 0) { continue; }
        //         pmem.towers.push(towerId);
        //         const pos = tower.pos;
        //         console.log(`Tower registered: ${towerId} in room ${pos.roomName} at pos ${pos.x}:${pos.y}`);
        //     }
        //     pmem.nextTowerScanTick = gTime + this.TowerScanTickrate;
        // }

        // for (let i = pmem.towers.length; i-- > 0;) {
        //     const towerId = pmem.towers[i];
        //     const tower = Game.getObjectById<StructureTower>(towerId);
        //     if (tower === null) {
        //         pmem.towers.splice(i);
        //         console.log(`Tower deregistered: ${towerId}`);
        //         continue;
        //     }
        //     if (tower == null) {//TODO: REMOVE AFTER CONFIRM
        //         console.log("Tower returned true for ==null after false for ===null! Docs or defs are inaccurate!");
        //         pmem.towers.splice(i);
        //         continue;
        //     }
        //     if (tower.energy === 0) {
        //         //Can't do much without energy
        //         continue;//TODO: Request energy from courier job queue someday?
        //     }

        //     const hostiles = tower.room.find<Creep>(FIND_HOSTILE_CREEPS);
        //     if (hostiles.length === 0) { continue; }

        //     let closest: Creep | undefined = undefined;
        //     if (hostiles.length === 1) {
        //         closest = hostiles[0];
        //     } else {
        //         const towerPos = tower.pos;
        //         closest = tower.pos.getClosest(hostiles);
        //         if (closest === undefined) { continue; }
        //     }
        //     //const expectedDamage = Math.max(150, Math.min(600, (25 - tower.pos.getRangeTo(closest)) * 30));
        //     if (closest.my) { console.log("Error: Tower is targetting allied creep!"); continue; }
        //     tower.attack(closest);
        // }
        return pmem;
    }

    public reloadFromMemory(pmem: ProcessMemory | undefined): void {
        if (pmem !== undefined) {
            this.pmem = <LinksMemory>pmem;
        } else {
            this.pmem = {
            };
        }
    }

    private findLinks(miningPosition: RoomPosition): string | undefined {
        const room = Game.rooms[miningPosition.roomName];
        if (room === undefined) { throw new Error("Room inaccessible"); }
        // const storage = room.storage;
        // if (storage === undefined) {
        //     return undefined;
        // }
        const links = room.find<Structure>(FIND_STRUCTURES).filter(s => s.structureType === STRUCTURE_LINK);
        const closest = miningPosition.getClosest(links);
        if (closest === undefined) {
            return;
        }
        const distanceToClosest = miningPosition.getRangeTo(closest);
        if (distanceToClosest > 1) {
            return;
        }
        if (links.length > 0) {
            return links[0].id;
        }
        return;
    }
}
