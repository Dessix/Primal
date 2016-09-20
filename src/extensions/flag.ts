import { safeExtendPrototype } from "../util/reflection";

class FlagX {

    public get id(this: Flag): string {
        return `flag-${this.name}`;
    }

    public lookForStructureAtPosition<T extends Structure>(this: Flag, structureType: string): T | undefined {
        return this.pos.lookForStructure<T>(structureType);
    }

    public readonly isFlag: boolean = true;
}

safeExtendPrototype(Flag, FlagX);
