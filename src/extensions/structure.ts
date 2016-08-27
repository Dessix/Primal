import { safeExtendPrototype } from "../util/reflection";

class StructureX extends OwnedStructure {

    public get memory(): Object | undefined {
        if (Memory.structures === undefined) {
            Memory.structures = {};
        }
        if (Memory.structures[this.id] === undefined) {
            Memory.structures[this.id] = {};
        }
        return Memory.structures[this.id];
    }

    public set memory(value: Object | undefined) {
        if (Memory.structures === undefined) {
            Memory.structures = {};
        }
        Memory.structures[this.id] = value;
    }

}

safeExtendPrototype(OwnedStructure, StructureX);
