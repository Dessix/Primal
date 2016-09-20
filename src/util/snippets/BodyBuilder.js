StructureSpawn.prototype.generateUpgraderForCost = function (cost, controllerLevel = 7) {
    let baseCreep = [WORK, CARRY];
    let growParts = [WORK, CARRY];

    let workParts = 15;
    if (controllerLevel < 8) workParts = 50;
    let opts = {useRoads: true, maxWork: workParts, maxCarry: 4};
    return this.buildCreepBody(cost, baseCreep, growParts, opts);
};
