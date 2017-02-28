interface Flag {
  readonly id: string;
  lookForStructureAtPosition<T extends Structure>(this: Flag, structureType: string): T | undefined;
}
