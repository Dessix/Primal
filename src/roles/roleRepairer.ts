import { BaseRole } from "./baseRole";

interface RepairerMemory extends CreepMemory {
    repr_working?: boolean;
}

export class RoleRepairer extends BaseRole {
    public static RoleTag: string = "repr";
    public get cmem() { return <RepairerMemory>this.creep.memory; }
    public set cmem(value: RepairerMemory) { this.creep.memory = value; }

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

    private performHarvest(creep: Creep, cmem: RepairerMemory): void {
        const spawn = Game.spawns[cmem.spawnName];
        let container: StructureContainer | undefined;
        const flags = spawn.room.find<Flag>(FIND_FLAGS);
        for (let flag of flags) {
            if (flag.color !== COLOR_GREY || flag.secondaryColor !== COLOR_YELLOW) {
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
        if (cmem.repr_working && creep.carry.energy === 0) {
            // switch state
            cmem.repr_working = false;
        } else if (!cmem.repr_working && creep.carry.energy === creep.carryCapacity) {// if creep is harvesting energy but is full
            // switch state
            cmem.repr_working = true;
        }

        // if creep is supposed to repair something
        if (!cmem.repr_working) {
            this.performHarvest(creep, cmem);
            return;
        }
        // find closest structure with less than max hits
        // Exclude walls because they have way too many max hits and would keep
        // our repairers busy forever. We have to find a solution for that later.
        const ctrlLvl = creep.room.controller.level;
        const structure = creep.pos.findClosestByRange<Structure>(FIND_STRUCTURES, {
            // the second argument for findClosestByPath is an object which takes
            // a property called filter which can be a function
            // we use the arrow operator to define it
            filter: (s: Structure) => {
                return s.hits < s.hitsMax &&
                    (s.structureType !== STRUCTURE_WALL || s.hits < 3000 * ctrlLvl) &&
                    (s.structureType !== STRUCTURE_RAMPART || s.hits < 3000 * ctrlLvl);
            },
        });


        // if we find one
        if (structure !== undefined) {
            if (creep.repair(structure) === ERR_NOT_IN_RANGE) {
                creep.moveTo(structure);
            }
        } else {// if we can't fine one
            // look for construction sites
            //roleBuilder.run(creep);
            if (creep.carry.energy < creep.carryCapacity) {
                this.performHarvest(creep, cmem);
            } else {
                const idleFlag = Game.spawns[cmem.spawnName].room.find<Flag>(FIND_FLAGS).find(x => x.color === COLOR_BROWN && x.secondaryColor === COLOR_BROWN);
                if (idleFlag !== undefined) {
                    creep.moveTo(idleFlag);
                }
            }
            cmem.repr_working = false;
        }

    }
}

