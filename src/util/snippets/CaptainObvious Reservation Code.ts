// CaptObvious Reservations Code

export interface ContainerMemory {
    
}

export class StructureContainerX {
    get memory(): ContainerMemory {
        if(_.isUndefined(Memory.containers)) {
            Memory.containers = {};
        }
        if(!_.isObject(Memory.containers)) {
            return undefined;
        }
        return Memory.containers[this.id] = Memory.containers[this.id] || {};
    }
    set function(value: ContainerMemory) {
        if(_.isUndefined(Memory.containers)) {
            Memory.containers = {};
        }
        if(!_.isObject(Memory.containers)) {
            throw new Error('Could not set source memory');
        }
        Memory.containers[this.id] = value;
    }

    Object.defineProperty(proto, 'getCapacityReservation', {
        configurable: true,
        value: function(reserverId) {
            if (reserverId) {
                return this.memory.reservations[reserverId] || 0;
            } else {
                return _.sum(_.values(this.memory.reservations)) || 0;
            }
        }
    });

    Object.defineProperty(proto, 'removeCapacityReservation', {
        configurable: true,
        value: function(reserverId) {
            if (
                _.isUndefined(this.memory.reservations) ||
                _.isUndefined(this.memory.reservations[reserverId])
            ) {
                return false;
            } else {
                delete this.memory.reservations[reserverId];
                return true;
            }
        }
    });

    Object.defineProperty(proto, 'capacityAvailable', {
        configurable: true,
        get: function() {
            let capacity = this.energyCapacity || this.storeCapacity;

            return capacity - (this.energy || _.sum(this.store)) - this.getCapacityReservation();  //This should never be below 0
        }
    });

    Object.defineProperty(proto, 'reserveCapacity', {
        configurable: true,
        value: function(reserverId, quantity) {
            if (_.isUndefined(this.memory.reservations)) {
                this.memory.reservations = {};
            }

            this.memory.reservations[reserverId] = Math.min(quantity, this.capacityAvailable);
        }
    });
};
