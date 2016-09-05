import { RoleBuilder } from "./roleBuilder";
import { BaseRole } from "./baseRole";

interface RepairerMemory extends CreepMemory {
    repr_working?: boolean;
}

export class RoleRepairer extends BaseRole<RepairerMemory> {
    public static RoleTag: string = "repr";

    public constructor() {
        super();
    }

    private static _instance: RoleRepairer | undefined;
    public static get Instance(): RoleRepairer {
        const instance = RoleRepairer._instance;
        if (instance === undefined) {
            return (RoleRepairer._instance = new RoleRepairer());
        }
        return instance;
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

    private getEnergy(creep: Creep, cmem: RepairerMemory): void {
        const spawn = Game.spawns[cmem.spawnName];

        let container: StructureContainer | undefined;

        const containers = new Array<StructureContainer>();
        //Try flagged storage containers
        const flags = spawn.room.find<Flag>(FIND_FLAGS);
        for (let flag of flags) {
            if (
                flag.color !== COLOR_GREY || flag.secondaryColor !== COLOR_YELLOW
            ) {
                continue;
            }
            const testContainer = flag.lookForStructureAtPosition<StructureContainer>(STRUCTURE_CONTAINER);
            if (testContainer !== undefined && testContainer.store["energy"] > 0) {
                containers.push(testContainer);
            }
        }

        if (containers.length !== 0) {
            if (containers.length === 1) {
                container = containers[0];
            } else {
                const fullest = containers.sort(function (a, b) { return b.store["energy"] - a.store["energy"]; })[0];
                container = fullest;
            }
        }

        if (container === undefined) {
            //Try any container
            container = spawn.room.findFirstStructureOfTypeMatching<StructureContainer>(STRUCTURE_CONTAINER, c => c.store.energy > 0, false);
        }

        if (container !== undefined) {
            if (container.transfer(creep, "energy") === ERR_NOT_IN_RANGE) {
                creep.moveTo(container);
            }
        }
    }

    public onRun(creep: Creep, cmem: RepairerMemory): void {
        if (creep.spawning) { return; }
        if (cmem.repr_working && creep.carry.energy === 0) {
            // switch state
            cmem.repr_working = false;
        } else if (!cmem.repr_working && creep.carry.energy === creep.carryCapacity) {// if creep is harvesting energy but is full
            // switch state
            cmem.repr_working = true;
        }

        // if creep is supposed to repair something
        if (!cmem.repr_working) {
            if (creep.carry.energy < creep.carryCapacity) {
                this.getEnergy(creep, cmem);
            } else {
                const idleFlag = Game.spawns[cmem.spawnName].room.find<Flag>(FIND_FLAGS).find(x => x.color === COLOR_BROWN && x.secondaryColor === COLOR_BROWN);
                if (idleFlag !== undefined) {
                    creep.moveTo(idleFlag);
                }
            }
            return;
        }
        // find closest structure with less than max hits
        // Exclude walls because they have way too many max hits and would keep
        // our repairers busy forever. We have to find a solution for that later.
        const ctrlLvl = creep.room.controller.level;
        const structuresNeedingRepair = creep.room.find<Structure>(FIND_STRUCTURES)
            .filter(s => s.hits < s.hitsMax && (
                (s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART) ||
                (s.structureType === STRUCTURE_WALL && s.hits < 25000 * ctrlLvl) &&
                (s.structureType === STRUCTURE_RAMPART && s.hits < 25000 * ctrlLvl)
            ))
            .sort(function (a, b) {
                if (a.structureType === STRUCTURE_WALL) {
                    return 1;
                } else if (b.structureType === STRUCTURE_WALL) {
                    return -1;
                }
                if (a.structureType === STRUCTURE_RAMPART) {
                    return 1;
                } else if (b.structureType === STRUCTURE_RAMPART) {
                    return 1;
                }
                return (a.hits / a.hitsMax) - (b.hits / b.hitsMax);
            })
            ;

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
            const idleFlag = Game.spawns[cmem.spawnName].room.find<Flag>(FIND_FLAGS).find(x => x.color === COLOR_BROWN && x.secondaryColor === COLOR_BROWN);
            if (idleFlag !== undefined) {
                creep.moveTo(idleFlag);
            }
            cmem.repr_working = false;
        }

    }
}

