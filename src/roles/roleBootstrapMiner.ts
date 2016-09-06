import { RoleBuilder } from "./roleBuilder";
import { FsmRole, StateHandlerList } from "./fsmRole";

enum BootstrapMinerState {
    Renew = -1,
    Carry = 0,
    Harvest = 1,
}

interface BootstrapMinerMemory extends CreepMemory {
    harv_state?: BootstrapMinerState;
    stateArg?: string;
    stateArgPath?: string;
}

export class RoleBootstrapMiner extends FsmRole<BootstrapMinerMemory, BootstrapMinerState> {
    public static RoleTag: string = "harv";

    public constructor() {
        super(BootstrapMinerState.Harvest, (mem, val) => mem.harv_state = val, (mem) => mem.harv_state);
    }

    private static _instance: RoleBootstrapMiner | undefined;
    public static get Instance(): RoleBootstrapMiner {
        const instance = RoleBootstrapMiner._instance;
        if (instance === undefined) {
            return (RoleBootstrapMiner._instance = new RoleBootstrapMiner());
        }
        return instance;
    }

    protected provideStates(): StateHandlerList<BootstrapMinerMemory, BootstrapMinerState> {
        return {
            [BootstrapMinerState.Harvest]: this.handleHarvest,
            [BootstrapMinerState.Carry]: this.handleCarry,
            [BootstrapMinerState.Renew]: this.handleRenew,
        };
    }

    protected onTransition(creep: Creep, cmem: BootstrapMinerMemory, prev: BootstrapMinerState, next: BootstrapMinerState) {
        if (prev !== next) {
            delete cmem.stateArg;
            delete cmem.stateArgPath;
        }
    }

    private shouldRenew(creep: Creep, cmem: BootstrapMinerMemory) {
        const spawn = creep.spawn;
        return (creep.ticksToLive < 75 && spawn.room.energyAvailable >= spawn.room.energyCapacityAvailable / 2 && creep.body.length > 13);
    }

    public static chooseBody(energyAvailable: number): CreepBodyPart[] | undefined {
        let chosenBody: string[];
        if (energyAvailable >= 1300) {
            chosenBody = [
                MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,//7 = 350
                CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,//9 = 450
                WORK, WORK, WORK, WORK, WORK,//5 = 500
            ];
        } else if (energyAvailable >= 1100) {
            chosenBody = [
                MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,//6 = 300
                CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, //8 = 400
                WORK, WORK, WORK, WORK,//4 = 400
            ];
        } else if (energyAvailable >= 950) {
            chosenBody = [
                MOVE, MOVE, MOVE, MOVE, MOVE,//5 = 250
                CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, //6 = 300
                WORK, WORK, WORK, WORK,//4 = 400
            ];
        } else if (energyAvailable >= 750) {
            chosenBody = [
                MOVE, MOVE, MOVE, MOVE,//4 = 200
                CARRY, CARRY, CARRY, CARRY, CARRY, //5 = 250
                WORK, WORK, WORK, //3 = 300
            ];
        } else if (energyAvailable >= 550) {
            chosenBody = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK];
        } else if (energyAvailable >= 400) {
            chosenBody = [MOVE, MOVE, CARRY, CARRY, WORK, WORK];
        } else if (energyAvailable >= 350) {
            chosenBody = [MOVE, MOVE, CARRY, CARRY, CARRY, WORK];
        } else if (energyAvailable >= 300) {
            chosenBody = [MOVE, MOVE, CARRY, CARRY, WORK];
        } else if (energyAvailable >= 200) {
            chosenBody = [MOVE, CARRY, WORK];
        } else {
            return undefined;
        }
        return <CreepBodyPart[]>chosenBody;
    }

    private getCarryTarget(creep: Creep, cmem: BootstrapMinerMemory): Spawn | Structure | undefined {
        if (cmem.stateArg !== undefined) {
            const rawTarget = Game.getObjectById(<string>cmem.stateArg);
            if (rawTarget !== null) {
                const struct = <Spawn | Structure>rawTarget;
                switch (struct.structureType) {
                    case STRUCTURE_EXTENSION:
                    case STRUCTURE_SPAWN: {
                        const spawnOrExt = <Spawn | StructureExtension>struct;
                        if (spawnOrExt.energy < spawnOrExt.energyCapacity) {
                            return spawnOrExt;
                        }
                        break;
                    }
                    case STRUCTURE_STORAGE:
                    case STRUCTURE_CONTAINER: {
                        const storageOrContainer = <StructureContainer | StructureStorage>struct;
                        if (storageOrContainer.store["energy"] < storageOrContainer.storeCapacity) {
                            return storageOrContainer;
                        }
                        break;
                    }
                    case STRUCTURE_TOWER: {
                        const tower = <StructureTower>struct;
                        if (tower.energy < tower.energyCapacity) {
                            return tower;
                        }
                        break;
                    }
                    default:
                        //Find a new target, selected one is full.
                        break;
                }
            }
            //console.log("Find new carry target");
            delete cmem.stateArg;
        }

        // This creep's spawn
        const spawn = creep.spawn;
        if (spawn !== undefined && spawn.energy < spawn.energyCapacity) {
            cmem.stateArg = spawn.id;
            return spawn;
        }

        let myStructures: Structure[] | undefined = undefined;
        if (spawn.room.energyAvailable < spawn.room.energyCapacityAvailable) {
            //Worth scanning for non-full extensions
            if (myStructures === undefined) { myStructures = spawn.room.find<Structure>(FIND_MY_STRUCTURES); }

            for (let ext of myStructures) {
                if (
                    ext.structureType !== STRUCTURE_EXTENSION ||
                    (<StructureExtension>ext).energy === (<StructureExtension>ext).energyCapacity
                ) {
                    continue;
                }
                cmem.stateArg = ext.id;
                return ext;
            }
        }

        if (myStructures === undefined) { myStructures = spawn.room.find<Structure>(FIND_MY_STRUCTURES); }
        for (let tower of myStructures) {
            if (
                tower.structureType !== STRUCTURE_TOWER ||
                (<StructureTower>tower).energy === (<StructureTower>tower).energyCapacity
            ) {
                continue;
            }
            cmem.stateArg = tower.id;
            return tower;
        }


        {
            const flags = spawn.room.find<Flag>(FIND_FLAGS);
            for (let flag of flags) {
                if (
                    flag.color !== COLOR_GREY || flag.secondaryColor !== COLOR_YELLOW
                ) {
                    continue;
                }
                const container = flag.pos.lookForStructure<StructureContainer>(STRUCTURE_CONTAINER);
                if (container !== undefined && _.sum(container.store) < container.storeCapacity) {
                    return container;
                }
            }
        }


        {
            const storage = spawn.room.storage;
            if (storage !== undefined && storage.store.energy < storage.storeCapacity) {
                cmem.stateArg = storage.id;
                return storage;
            }
        }

        //Screw it, go to spawn
        cmem.stateArg = spawn.id;
        return spawn;
    }

    private handleRenew(creep: Creep, cmem: BootstrapMinerMemory): BootstrapMinerState | undefined {
        const spawn = creep.spawn;
        if (creep.ticksToLive >= 1400 || spawn.room.energyAvailable < spawn.room.energyCapacityAvailable / 2) {
            return BootstrapMinerState.Carry;
        }

        const renewRes = spawn.renewCreep(creep);
        if (renewRes === ERR_NOT_IN_RANGE) {
            creep.moveTo(spawn);
            return;
        }

        if (renewRes === ERR_NOT_ENOUGH_ENERGY) {
            spawn.recycleCreep(creep);
            return;
        }

        return;
    }

    private doRoadMaintenance(creep: Creep, cmem: BootstrapMinerMemory): boolean {
        if (!Memory.config.boostrapsRepair) { return false; }
        const constructions = creep.pos.lookFor<ConstructionSite>(LOOK_CONSTRUCTION_SITES);
        if (constructions.length > 0) {
            creep.build(constructions[0]);
            return true;
        }

        const road = <StructureRoad | undefined>creep.pos.lookFor<Structure>(LOOK_STRUCTURES).find(x => x.structureType === STRUCTURE_ROAD || x.structureType === STRUCTURE_CONTAINER);
        if (road !== undefined && road.hits < road.hitsMax) {
            creep.repair(road);
            return true;
        }
        return false;
    }

    private handleCarry(creep: Creep, cmem: BootstrapMinerMemory): BootstrapMinerState | undefined {
        const spawn = creep.spawn;
        if (creep.carry.energy === 0) {
            return BootstrapMinerState.Harvest;
        }

        if (this.shouldRenew(creep, cmem)) {
            return BootstrapMinerState.Renew;
        }

        if (this.doRoadMaintenance(creep, cmem)) { return; }

        let target = this.getCarryTarget(creep, cmem);
        if (target === undefined) {
            if (creep.carry.energy < creep.carryCapacity) {
                return BootstrapMinerState.Harvest;
            } else {
                return;
            }
        }
        let isFull: boolean;
        if (target.structureType === STRUCTURE_SPAWN || target.structureType === STRUCTURE_TOWER || target.structureType === STRUCTURE_EXTENSION) {
            const tstrct = <Spawn | StructureTower | StructureExtension>target;
            isFull = (tstrct.energy === tstrct.energyCapacity);
        } else {
            const tstrct = <StructureContainer | StructureStorage>target;
            isFull = (tstrct.store["energy"] === tstrct.storeCapacity);
        }
        if (isFull) {
            RoleBuilder.Instance.run(creep);
            return;
        }
        if (creep.transfer(target, "energy") === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
        return;
    }

    private getHarvestTarget(creep: Creep, cmem: BootstrapMinerMemory): Source | Flag | undefined {
        if (cmem.stateArg !== undefined) {
            let rawTarget = global.getObjectOrFlagById(<string>cmem.stateArg);
            if (rawTarget !== null) {
                if (cmem.stateArg.startsWith("flag-")) {
                    const flag = <Flag>rawTarget;
                    return flag;
                } else {
                    const source = <Source>rawTarget;
                    if (source.energy !== 0) {
                        return source;
                    }
                }
            }
            //console.log(`Must find a new harvest target instead of ${cmem.stateArg}`);
            delete cmem.stateArg;
        }

        // This creep's spawn
        const spawn = creep.spawn;

        //TODO: Add flag-avoidance for drills

        /*const occupiedSources: Source[] = [];
        {
            const roomSources = spawn.room.find<Source>(FIND_SOURCES_ACTIVE);
            let unoccupiedSources: Source[] = [];
            for (let i = roomSources.length; i-- > 0;) {
                const source = roomSources[i];
                if (source.pos.findInRange(FIND_MY_CREEPS, 1).length === 0) {
                    unoccupiedSources.push(source);
                } else {
                    occupiedSources.push(source);
                }
            }
            if (unoccupiedSources.length > 0) {
                cmem.stateArg = unoccupiedSources[0].id;
                return unoccupiedSources[0];
            }
        }*/



        const remoteMiningFlags: Flag[] = [];
        {
            const remoteMiningRoomNames: string[] = [];
            {
                const spawnRoomFlags = spawn.room.find<Flag>(FIND_FLAGS);
                for (let flag of spawnRoomFlags) {
                    if (flag.color !== COLOR_GREEN || flag.secondaryColor !== COLOR_GREEN) {
                        continue;
                    }
                    const hintFlag = flag;//Room name hint flag
                    const targetRoomName = hintFlag.name.split(":")[1];
                    if (remoteMiningRoomNames.indexOf(targetRoomName) < 0) {
                        remoteMiningRoomNames.push(targetRoomName);
                    }
                }
            }

            {
                const flags = Game.flags;
                for (let flagName in flags) {
                    const flag = flags[flagName];
                    if (flag.color !== COLOR_GREEN && flag.secondaryColor !== COLOR_YELLOW) {
                        continue;
                    }

                    if (remoteMiningRoomNames.indexOf(flag.pos.roomName) < 0) {
                        continue;
                    }

                    //This flag is an option!
                    remoteMiningFlags.push(flag);
                }
            }

            if (remoteMiningFlags.length !== 0) {
                //TODO: Allocate remote routes globally
                const chosen = remoteMiningFlags[~~(Math.random() * remoteMiningFlags.length)];
                cmem.stateArg = chosen.id;
                return chosen;
            }
        }

        return;
    }

    private handleHarvest(creep: Creep, cmem: BootstrapMinerMemory): BootstrapMinerState | undefined {
        const spawn = creep.spawn;
        if (creep.carry.energy === creep.carryCapacity) {
            return BootstrapMinerState.Carry;
        }
        if (this.shouldRenew(creep, cmem)) {
            return BootstrapMinerState.Renew;
        }
        const target = this.getHarvestTarget(creep, cmem);
        if (target === undefined) { return; }

        if ((<Flag>target).color !== undefined) {
            //target is a flag
            const flag = <Flag>target;
            const flagRoom = flag.room;
            if (flagRoom !== undefined) {
                //room is visible
                const sourcesAtPos = flag.pos.lookFor<Source>(LOOK_SOURCES);
                if (sourcesAtPos.length !== 0) {
                    const source = sourcesAtPos[0];
                    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                        if (creep.moveTo(source) !== OK) {
                            delete cmem.stateArg;
                        }
                    }
                } else {
                    console.log("Remote mining flag where there is no source to mine?");
                    delete cmem.stateArg;
                }
            } else {
                if (creep.moveTo(flag) === ERR_NO_PATH) {
                    delete cmem.stateArg;
                }
            }
        } else {
            const source = <Source>target;
            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                if (creep.moveTo(source) === ERR_NO_PATH) {
                    delete cmem.stateArg;
                }
            }
        }

        return;
    }
}

