
// class FakeCreep {
// public moveTo(target: RoomPosition | { pos: RoomPosition }, maxRooms: number): number {
//     let that = this;

//     const cacheTimeout: number = 15;

//     if (!that.creep.memory.cacheTimeout || that.creep.memory.cacheTimeout === 0) {
//         that.creep.memory.cacheTimeout = cacheTimeout;
//     }

//     if (!that.creep.memory.pathCache || that.creep.memory.pathCache.length === 0
//         || that.creep.memory.cacheTimeout === 0) {
//         that.creep.memory.pathCache = that.creep.pos.findPathTo(target, { maxRooms: maxRooms });
//         return 0;
//     } else {
//         let path: PathStep[] = that.creep.memory.pathCache;
//         if (Config.VERBOSE) {
//             console.log(that.creep.name);
//             console.log("Path: ", path[0].x, path[0].y, that.creep.room.name);
//         }
//         let nextPosition: RoomPosition = new RoomPosition(path[0].x, path[0].y, that.creep.room.name);

//         if (nextPosition.lookFor(LOOK_CREEPS).length > 0) {
//             that.creep.memory.pathCache = that.creep.pos.findPathTo(target, { maxRooms: maxRooms });
//             that.creep.memory.cacheTimeout = cacheTimeout;
//             return 0;
//         } else {
//             that.creep.memory.cacheTimeout = that.creep.memory.cacheTimeout - 1;
//             let nextStep: PathStep | undefined = path.shift();
//             if (nextStep) {
//                 return that.creep.move(nextStep.direction);
//             } else {
//                 return 0;
//             }
//         }
//     }
// }
// }
