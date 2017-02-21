import { BaseRole } from "./baseRole";

interface BardMemory extends CreepMemory {
}

export class RoleBard extends BaseRole<BardMemory> {
    public static RoleTag: string = "bard";

    public constructor() {
        super();
    }

    private static _instance: RoleBard | undefined;
    public static get Instance(): RoleBard {
        const instance = RoleBard._instance;
        if (instance === undefined) {
            return (RoleBard._instance = new RoleBard());
        }
        return instance;
    }

    public static chooseBody(energyAvailable: number): BODYPART[] | undefined {
        let chosenBody: string[];
        if (energyAvailable >= 650) {
            chosenBody = [
                TOUGH, TOUGH, //2 = 20
                ATTACK, //1 = 80
                ATTACK, //1 = 80
                RANGED_ATTACK, //1 = 150
                MOVE, MOVE, MOVE, MOVE,//4 = 200
                MOVE, MOVE,//2 = 100
            ];
        } else {
            return undefined;
        }
        return <BODYPART[]>chosenBody;
    }

    public onRun(creep: Creep, cmem: BardMemory): void {
        if (creep.spawning) { return; }
        const spawn = creep.spawn;
        let flag = _.find(Game.flags, f => f.color === COLOR_RED && f.secondaryColor === COLOR_RED);
        if (flag === undefined) {
            creep.say("No Orders");
            const idleAttackFlag = Game.spawns[cmem.spawnName].room.find(FIND_FLAGS).find(x => x.color === COLOR_BROWN && x.secondaryColor === COLOR_RED);
            if (creep.ticksToLive > 1450) {
                if (idleAttackFlag !== undefined) {
                    creep.moveTo(idleAttackFlag);
                }
                return;
            } else if (idleAttackFlag === undefined) {
                console.log("No orders flags, recycling.");
                if (spawn.recycleCreep(creep) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(spawn);
                }
            }
            if (creep.room.name === spawn.room.name) {
                if (spawn.renewCreep(creep) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(spawn);
                }
            }
            return;
        }
        let target: Creep | Spawn | Structure | undefined;
        if (creep.pos.roomName === flag.pos.roomName) {
            if (this.moveOffBorder(creep)) {
                return;
            }
        }

        const enemySpawn = creep.room.find(FIND_HOSTILE_SPAWNS);
        if ((target = enemySpawn.pop()) !== undefined) {
            console.log("TARGET SPAWN");
            const attackRet = creep.attack(target);
            if (attackRet === ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
                let hostileCreepsAndStructures = [...creep.room.find(FIND_HOSTILE_STRUCTURES), ...creep.room.find(FIND_HOSTILE_CREEPS)];
                if (hostileCreepsAndStructures.length === 0) {
                    return;
                }
                const closest = creep.pos.getClosest(hostileCreepsAndStructures);
                if (closest === undefined) {
                    return;
                }
                creep.rangedAttack(closest);
                creep.attack(closest);
                return;
            } else if (attackRet === OK) {
                creep.rangedAttack(target);
            }
            return;
        }

        let hostileCreep = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        console.log("HOSTILES: " + hostileCreep);
        if (hostileCreep) {
            target = hostileCreep;
            if (creep.pos.getRangeTo(target) > 3) {
                creep.moveTo(target);
                return;
            }
            let ret = creep.rangedAttack(target);
            if (ret === ERR_NOT_IN_RANGE) {
                // creep.moveTo(target);
                return;
            }
            return;
        }

        const enemyStructures = creep.room.find(FIND_HOSTILE_STRUCTURES);
        if (enemyStructures.length > 0 && (target = creep.pos.getClosest(enemyStructures)) !== undefined) {
            console.log("TARGET STRUCTURE");
            const attackRet = creep.attack(target);
            if (attackRet === ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
                let hostileCreepsAndStructures = [...creep.room.find(FIND_HOSTILE_STRUCTURES), ...creep.room.find(FIND_HOSTILE_CREEPS)];
                if (hostileCreepsAndStructures.length === 0) {
                    return;
                }
                const closest = creep.pos.getClosest(hostileCreepsAndStructures);
                if (closest === undefined) {
                    return;
                }
                creep.rangedAttack(closest);
                creep.attack(closest);
                return;
            } else if (attackRet === OK) {
                creep.rangedAttack(target);
            }
            return;
        }
        // creeps = creep.room.find(FIND_CREEPS).filter(c=>!c.my)
        // console.log('B',creep.name,creep.room.name,creeps,creeps.length)
        // if (creeps.length) {
        //     target = creeps[0]
        //     creep.moveTo(target)
        //     let ret = creep.attack(target)
        //     if(ret == ERR_NOT_IN_RANGE)
        //         creep.moveTo(target)
        //     return
        // }
        {
            //let creeps = utils.creeps.filter(c => c.memory.role == "manualattack");
            //creep.moveTo(new RoomPosition(0, 37 + creeps.indexOf(creep), "W42S13"));
            //return;
        }
        creep.moveTo(flag);
    }
}

