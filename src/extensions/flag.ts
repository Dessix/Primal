import { safeExtendPrototype } from "../util/reflection";

class FlagX extends Flag {

    public get id(this: Flag): string {
        return `flag-${this.name}`;
    }

    public readonly isFlag: boolean = true;

}

safeExtendPrototype(Flag, FlagX);
