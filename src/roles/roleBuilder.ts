import { BaseRole } from "./baseRole";

interface BuilderMemory extends CreepMemory {
    bild_building?: boolean;
}

export class RoleBuilder extends BaseRole<BuilderMemory> {
    public static RoleTag: string = "bild";

    public constructor() {
        super();
    }

    private static _instance: RoleBuilder | undefined;
    public static get Instance(): RoleBuilder {
        const instance = RoleBuilder._instance;
        if (instance === undefined) {
            return (RoleBuilder._instance = new RoleBuilder());
        }
        return instance;
    }

    public static chooseBody(energyAvailable: number): CreepBodyPart[] | undefined {
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
        } else if (energyAvailable >= 300) {
            chosenBody = [MOVE, MOVE, CARRY, CARRY, WORK];
        } else {
            return undefined;
        }
        return <CreepBodyPart[]>chosenBody;
    }

    private getResources(creep: Creep, cmem: BuilderMemory): void {
        const spawn = creep.spawn;

        let container: StructureContainer | undefined;

        {
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
                    const fullest = containers.sort(function(a, b) { return b.store["energy"] - a.store["energy"]; })[0];
                    container = fullest;
                }
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

    public onRun(creep: Creep, cmem: BuilderMemory): void {
        if (creep.spawning) { return; }
        if (cmem.bild_building && creep.carry.energy === 0) {
            cmem.bild_building = false;
            creep.say("energy");
        }
        if (!cmem.bild_building && creep.carry.energy === creep.carryCapacity) {
            cmem.bild_building = true;
            creep.say("production");
        }

        if (cmem.bild_building) {
            const targets = creep.room.find<ConstructionSite>(FIND_CONSTRUCTION_SITES);
            if (targets.length !== 0) {
                if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            } else {
                if (creep.carry.energy < creep.carryCapacity) {
                    this.getResources(creep, cmem);
                } else {
                    const idleFlag = Game.spawns[cmem.spawnName].room.find<Flag>(FIND_FLAGS).find(x => x.color === COLOR_BROWN && x.secondaryColor === COLOR_BROWN);
                    if (idleFlag !== undefined) {
                        creep.moveTo(idleFlag);
                    }
                }
            }
        } else {
            this.getResources(creep, cmem);
        }
    }
}

