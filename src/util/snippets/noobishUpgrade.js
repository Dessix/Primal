// upgrade called earlier     
if (this.carry[RESOURCE_ENERGY] <= this.getNumWork()) {
  let storage = this.room.storage;
  if (storage) {
    if (this.pos.isNearTo(storage)) {
      if (storage.store[RESOURCE_ENERGY] > this.carryCapacity) {
        if (debug) console.log(this.name + " runUpgrader energy is empty, trying to fill from storage");
        this.withdraw(storage, RESOURCE_ENERGY);
      }
    } else {
      this.travelTo(storage, 1);
    }
  } else {
    if (debug) console.log(this.name + " runUpgrader: no energy available to upgrade, waiting..");
  }
}
