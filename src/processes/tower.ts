import { Process, ProcessStatus } from "../kernel/process";

type TowerId = string;
interface TowerMemory extends ProcessMemory {
    nextTowerScanTick?: number;
    towers: TowerId[];
}

export class PTower extends Process {
    public static className: string = "Tower";
    public get className(): string { return PTower.className; }
    public readonly TowerScanTickrate: number = 15;
    private pmem: TowerMemory;

    public constructor(pid: ProcessId, parentPid: ProcessId) {
        super(pid, parentPid);
    }

    public run(): ProcessMemory | undefined {
        const pmem = this.pmem;
        const gTime = Game.time;

        if (pmem.nextTowerScanTick === undefined || gTime >= pmem.nextTowerScanTick) {
            const towers = pmem.towers;
            const structures = Game.structures;
            for (let structureName in structures) {
                const structure = structures[structureName];
                if (structure.structureType !== STRUCTURE_TOWER || !(<StructureTower>structure).my) { continue; }
                const tower = <StructureTower>structure;
                const towerId = tower.id;
                if (towers.indexOf(towerId) >= 0) { continue; }
                pmem.towers.push(towerId);
                const pos = tower.pos;
                console.log(`Tower registered: ${towerId} in room ${pos.roomName} at pos ${pos.x}:${pos.y}`);
            }
            pmem.nextTowerScanTick = gTime + this.TowerScanTickrate;
        }

        for (let i = pmem.towers.length; i-- > 0;) {
            const towerId = pmem.towers[i];
            const tower = Game.getObjectById<StructureTower>(towerId);
            if (tower === null) {
                pmem.towers.splice(i);
                console.log(`Tower deregistered: ${towerId}`);
                continue;
            }
            if (tower == null) {//TODO: REMOVE AFTER CONFIRM
                console.log("Tower returned true for ==null after false for ===null! Docs or defs are inaccurate!");
                pmem.towers.splice(i);
                continue;
            }
            if (tower.energy === 0) {
                //Can't do much without energy
                continue;//TODO: Request energy from courier job queue someday?
            }

            const hostiles = tower.room.find<Creep>(FIND_HOSTILE_CREEPS);
            if (hostiles.length === 0) { continue; }

            let closest: Creep | undefined = undefined;
            if (hostiles.length === 1) {
                closest = hostiles[0];
            } else {
                const towerPos = tower.pos;
                closest = tower.pos.getClosest(hostiles);
                if (closest === undefined) { continue; }
            }
            //const expectedDamage = Math.max(150, Math.min(600, (25 - tower.pos.getRangeTo(closest)) * 30));
            if (closest.my) { console.log("Error: Tower is targetting allied creep!"); continue; }
            tower.attack(closest);
        }
        return pmem;
    }

    public reloadFromMemory(pmem: ProcessMemory | undefined): void {
        if (pmem !== undefined) {
            this.pmem = <TowerMemory>pmem;
        } else {
            this.pmem = {
                towers: [],
            };
        }
    }
}
