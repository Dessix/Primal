import { safeExtendPrototype } from "../util/reflection";

class StringX {
  public padRight(this: string, length: number, c: string = " ") {
    return this + c.repeat(length - this.length);
  }
  public padLeft(this: string, length: number, c: string = " ") {
    return c.repeat(length - this.length) + this;
  }
}

safeExtendPrototype(String, StringX, false);
