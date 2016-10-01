Room.prototype.purgeExtensionFillCache = function () {
    _.set(this.memory, ["courierCache", "expiration"], 0);
};

Room.prototype.getSpawnsAndExtensionsToFill = function () {
    let memCacheExpiry = _.get(this.memory, ["courierCache", "expiration"], 0);
    if(memCacheExpiry < Game.time) {
        let targets = this.find(FIND_MY_STRUCTURES, {
            filter: s => (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && s.energy < s.energyCapacity
        });

        memCacheExpiry = Game.time + _.random(150, 250);
        _.set(this.memory, ["courierCache", "data"], _.map(targets, t => t.id));
        _.set(this.memory, ["courierCache", "expiration"], memCacheExpiry);
        _.set(global, ["roomCaches", this.name, "courierCache"], {[memCacheExpiry]: targets});
    }

    let cachedExtensions = _.get(global, ["roomCaches", this.name, "courierCache", memCacheExpiry]);
    if(!cachedExtensions) {
        let memDataIds = _.get(this.memory, ["courierCache", "data"], []);
        cachedExtensions = _.map(memDataIds, id => Game.getObjectById(id));
        _.set(global, ["roomCaches", this.name, "courierCache"], {[memCacheExpiry]: cachedExtensions});
    }

    return cachedExtensions;
};
