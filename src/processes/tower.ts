import { Process } from "../kernel/process";

type TowerId = string;
interface TowerMemory extends ProcessMemory {
	nextTowerScanTick?: number;
	towers: TowerId[];
}

export class PTower extends Process<TowerMemory> {
	public static className: string = "Tower";
	public readonly baseHeat: number = 15;

	public readonly TowerScanTickrate: number = 50;

	public constructor(pid: ProcessId, parentPid: ProcessId) {
		super(pid, parentPid);
	}

	private getTowers(pmem: TowerMemory): Array<Tower> {
		const gTime = Game.time;
		const towerIds = pmem.towers;
		if(pmem.nextTowerScanTick === undefined || gTime > pmem.nextTowerScanTick) {
			const structures = Game.structures, structureNames = Object.keys(structures);
			for(let i = 0, n = structureNames.length; i < n; ++i) {
				const structureName = structureNames[i], structure = structures[structureName];
				if(!(structure instanceof StructureTower) || !structure.my) { continue; }
				const towerId = structure.id;
				if(towerIds.indexOf(towerId) >= 0) { continue; }
				towerIds.push(towerId);
				const pos = structure.pos;
				console.log(`Tower registered: ${towerId} in room ${pos.roomName} at pos ${pos.x}:${pos.y}`);
			}
			pmem.nextTowerScanTick = gTime + this.TowerScanTickrate;
		}
		const towers = new Array<Tower>(towerIds.length);
		for(let i = towers.length; i-- > 0;) {//reverse iteration for easy removal
			const towerId = towerIds[i];
			const tower = fromId<StructureTower>(towerId);
			if(tower === undefined) {
				towerIds.splice(i);
				towers.splice(i);
				console.log(`Tower deregistered: ${towerId}`);
				continue;
			}
			towers[i] = tower;
		}
		pmem.towers = towerIds;
		return towers;
	}

	public run(pmem: TowerMemory): void {
		const towers = this.getTowers(pmem);
		const scannedHostiles: { [roomName: string]: Array<Creep> | undefined } = {};

		for(let i = 0, n = towers.length; i < n; ++i) {
			const tower = towers[0];
			if(tower.energy === 0) {//Can't do much without energy
				continue;//TODO: Request energy from courier job queue
			}
			let hostiles = scannedHostiles[tower.room.name];
			if(hostiles === undefined) {
				hostiles = tower.room.find<Creep>(FIND_HOSTILE_CREEPS);
				scannedHostiles[tower.room.name] = hostiles;
			}

			if(hostiles.length === 0) { continue; }
			let closest: Creep | undefined;
			if(hostiles.length === 1) {
				closest = hostiles[0];
			} else {
				const towerPos = tower.pos;
				closest = towerPos.getClosest(hostiles);
				if(closest === undefined) { continue; }
			}
			//const expectedDamage = Math.max(150, Math.min(600, (25 - tower.pos.getRangeTo(closest)) * 30));
			if(closest.my) { console.log("Error: Tower is targetting allied creep!"); continue; }
			tower.attack(closest);
		}
	}
}
