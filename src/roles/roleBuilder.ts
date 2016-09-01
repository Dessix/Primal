import { BaseRole } from "./baseRole";

interface BuilderMemory extends CreepMemory {
    bild_building?: boolean; 
}

export class RoleBuilder extends BaseRole {
    public static RoleTag: string = "bild";
    public get cmem() { return <BuilderMemory>this.creep.memory; }
    public set cmem(value: BuilderMemory) { this.creep.memory = value; }

    public constructor(creep: Creep) {
        super(creep);
    }

    public static chooseBody(energyAvailable: number): CreepBodyPart[] {
        let chosenBody: string[];
        if (energyAvailable >= 750) {
            chosenBody = [
                MOVE, MOVE, MOVE, MOVE,//4 = 200
                CARRY, CARRY, CARRY, CARRY, CARRY, //5 = 250
                WORK, WORK, WORK, //3 = 300
            ];
        } else if (energyAvailable >= 550) {
            chosenBody = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK];
        } else if (energyAvailable >= 400) {
            chosenBody = [MOVE, MOVE, CARRY, CARRY, WORK, WORK];
        } else {
            chosenBody = [MOVE, MOVE, CARRY, CARRY, WORK];
        }
        return <CreepBodyPart[]>chosenBody;
    }

    private performHarvest(creep: Creep, cmem: BuilderMemory): void {
        const spawn = Game.spawns[cmem.spawnName];
        let container: StructureContainer | undefined;
        const flags = spawn.room.find<Flag>(FIND_FLAGS);
        for (let flag of flags) {
            if (
                flag.color !== COLOR_GREY || flag.secondaryColor !== COLOR_YELLOW
            ) {
                continue;
            }
            const testContainer = flag.lookForStructureAtPosition<StructureContainer>(STRUCTURE_CONTAINER);
            if (testContainer !== undefined && testContainer.store["energy"] > creep.carryCapacity) {
                container = testContainer;
            }
        }

        if (container !== undefined) {
            if (container.transfer(creep, "energy") === ERR_NOT_IN_RANGE) {
                creep.moveTo(container);
            }
        } else {
            let sources = creep.room.find<Source>(FIND_SOURCES).filter(s => s.pos.lookFor<Flag>(LOOK_FLAGS).find(f => f.color === COLOR_GREEN && f.secondaryColor === COLOR_YELLOW) === undefined);
            if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
        }
    }

    public run(): void {
        const creep = this.creep;
        if (creep.spawning) { return; }
        const cmem = this.cmem;
        if (cmem.bild_building && creep.carry.energy === 0) {
            cmem.bild_building = false;
            creep.say("harvesting");
        }
        if (!cmem.bild_building && creep.carry.energy === creep.carryCapacity) {
            cmem.bild_building = true;
            creep.say("building");
        }

        if (cmem.bild_building) {
            const targets = creep.room.find<ConstructionSite>(FIND_CONSTRUCTION_SITES);
            if (targets.length !== 0) {
                if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            } else {
                if (creep.carry.energy < creep.carryCapacity) {
                    this.performHarvest(creep, cmem);
                } else {
                    // const idleFlag = Game.spawns[cmem.spawnName].room.find<Flag>(FIND_FLAGS).find(x => x.color === COLOR_BROWN && x.secondaryColor === COLOR_BROWN);
                    // if (idleFlag !== undefined) {
                    //     creep.moveTo(idleFlag);
                    // }
                }
            }
        } else {
            this.performHarvest(creep, cmem);
        }
    }
}

