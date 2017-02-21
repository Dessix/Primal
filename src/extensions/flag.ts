import { safeExtendPrototype } from "../util/reflection";

class FlagX {

    public get id(this: Flag): string {
        return `flag-${this.name}`;
    }

    public lookForStructureAtPosition<TSTRUCTURE extends STRUCTURE>(this: Flag, structureType: TSTRUCTURE): STRUCTURE_TARGET<TSTRUCTURE> | undefined {
        return this.pos.lookForStructure(structureType);
    }

    public readonly isFlag: boolean = true;
}

safeExtendPrototype(Flag, FlagX);
