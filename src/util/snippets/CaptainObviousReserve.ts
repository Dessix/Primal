// CaptObvious Reservations Code

export class StructureContainerX {
  public get memory(this: StructureStorage): ContainerMemory {
    if (Memory.containers === undefined) {
      Memory.containers = {};
    }
    return Memory.containers[this.id] = Memory.containers[this.id] || {};
  }

  public set memory(this: StructureStorage, value: ContainerMemory) {
    if (Memory.containers === undefined) {
      Memory.containers = {};
    }
    Memory.containers[this.id] = value;
  }

  public getCapacityReservation(this: StructureStorage, reserverId?: string): number {
    const reservations = this.memory.reservations;
    if (reservations === undefined) { return 0; }
    if (reserverId) {
      return reservations[reserverId] || 0;
    } else {
      return _.sum(Object.values(reservations)) || 0;
    }
  }

  public removeCapacityReservation(this: StructureStorage, reserverId: string): boolean {
    if (
      this.memory.reservations !== undefined &&
      this.memory.reservations[reserverId] !== undefined
    ) {
      return delete this.memory.reservations[reserverId];
    }
    return false;
  }

  public get capacityAvailable(this: StructureStorage): number {
    const capacity = this.storeCapacity;
    return capacity - (this.store.energy || _.sum(this.store) || 0) - this.getCapacityReservation();  //This should never be below 0
  }

  public reserveCapacity(this: StructureStorage, reserverId: string, quantity: number): void {
    if (this.memory.reservations === undefined) {
      this.memory.reservations = {};
    }
    this.memory.reservations[reserverId] = Math.min(quantity, this.capacityAvailable);
  }
}
