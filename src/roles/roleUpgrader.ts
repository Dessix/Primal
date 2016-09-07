import { BaseRole } from "./baseRole";

export interface UpgraderMemory extends CreepMemory {
    upgrading?: boolean;
}

export class RoleUpgrader extends BaseRole<UpgraderMemory> {
    public static RoleTag: string = "upgr";

    private static _instance: RoleUpgrader | undefined;
    public static get Instance(): RoleUpgrader {
        const instance = RoleUpgrader._instance;
        if (instance === undefined) {
            return (RoleUpgrader._instance = new RoleUpgrader());
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

    private performHarvest(creep: Creep, cmem: UpgraderMemory): void {
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
                    const fullest = containers.sort(function (a, b) { return b.store["energy"] - a.store["energy"]; })[0];
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
        } else {
            let sources = creep.room.find<Source>(FIND_SOURCES);
            if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
        }
    }

    public onRun(creep: Creep, cmem: UpgraderMemory): void {
        if (creep.spawning) { return; }
        if (cmem.upgrading && creep.carry.energy === 0) {
            cmem.upgrading = false;
            creep.say("harvesting");
        }
        if (!cmem.upgrading && creep.carry.energy === creep.carryCapacity) {
            cmem.upgrading = true;
            creep.say("upgrading");
        }

        if (cmem.upgrading) {
            if (creep.room.controller !== undefined && creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            } else {
                if (creep.ticksToLive % 23 === 0) {
                    creep.say(_.shuffle(["Zap!", "GCL!", "420PRAIZIT"])[0], false);
                }
            }
        } else {

            //order of preference: flagged container, storage, sources

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
                    const closest = <StructureContainer>creep.pos.getClosest(containers);
                    container = closest;
                }
            }

            if (container !== undefined) {
                if (container.transfer(creep, "energy") === ERR_NOT_IN_RANGE) {
                    creep.moveTo(container);
                }
            } else {
                let storage = spawn.room.storage;
                if (storage !== undefined) {
                    if (storage.store["energy"] > creep.carryCapacity) {
                        container = storage;
                        if (container.transfer(creep, "energy") === ERR_NOT_IN_RANGE) {
                            creep.moveTo(container);
                        }
                    }
                } else {
                    let sources = spawn.room.find<Source>(FIND_SOURCES);
                    if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(sources[0]);
                    }
                }
            }
        }

    }
}

