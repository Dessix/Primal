import { safeExtendPrototype } from "../util/reflection";

class StructureX extends OwnedStructure {

    public get memory(): StructureMemory {
        if (Memory.structures === undefined) {
            Memory.structures = {};
        }
        if (Memory.structures[this.id] === undefined) {
            Memory.structures[this.id] = {};
        }
        return Memory.structures[this.id]!;
    }

    public set memory(value: StructureMemory) {
        if (Memory.structures === undefined) {
            Memory.structures = {};
        }
        Memory.structures[this.id] = value;
    }

}

safeExtendPrototype(StructureContainer, StructureX);
safeExtendPrototype(StructureStorage, StructureX);
