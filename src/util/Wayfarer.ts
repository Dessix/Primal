const ROOM_TAG_LENGTH = 8;

export class Wayfarer {
  //Bovius's Unicode Compression
  public static roomPosToUnicode(this: void, pos: RoomPosition) {
    return String.fromCharCode((pos.x << 8) + pos.y);
  }

  public static roomPosFromUnicode(this: void, character: string, roomName: string): RoomPosition {
    const integer = character.charCodeAt(0);
    return new RoomPosition(
      (integer >> 8),
      (integer & 255),
      roomName
    );
  }

  public static roomPosFromUnicodeFast(this: void, character: string): { x: number; y: number; } {
    const integer = character.charCodeAt(0);
    return { x: (integer >> 8), y: (integer & 255) };
  }

  public static get RoomTagLength(): number {
    return ROOM_TAG_LENGTH;
  }

  public static getPathLength(this: void, pathChunks: string[]): number {
    let totalStepLength = 0;
    for (let i = pathChunks.length; i-- > 0;) {
      totalStepLength += pathChunks[i].length - ROOM_TAG_LENGTH;
    }
    return totalStepLength;
  }

  /**
   * @return string[] of whitespace-right-padded ROOM_TAG_LENGTH characters roomName followed by
   * 1 character per position in each room per string. One string per room in path.
   */
  public static serializePath(this: void, positions: RoomPosition[]): string[] {
    const outputPaths = new Array<string>();
    let currentRoomPath = "";
    let currentRoomName: string | undefined = undefined;
    for (let i = 0, n = positions.length; i < n; ++i) {
      const pos = positions[i];
      if (pos.roomName !== currentRoomName) {
        if (currentRoomPath.length !== 0 && currentRoomName !== undefined) {
          outputPaths.push(currentRoomName.padRight(ROOM_TAG_LENGTH) + currentRoomPath);
          currentRoomPath = "";
        }
        currentRoomName = pos.roomName;
      }
      currentRoomPath += Wayfarer.roomPosToUnicode(pos);
    }
    if (currentRoomName !== undefined && currentRoomPath.length !== 0) {
      outputPaths.push(currentRoomName.padRight(ROOM_TAG_LENGTH) + currentRoomPath);
    }
    return outputPaths;
  }

  public static deserializePath(this: void, pathChunks: string[]): RoomPosition[] {
    let totalStepLength = 0;
    for (let i = pathChunks.length; i-- > 0;) {
      totalStepLength += pathChunks[i].length - ROOM_TAG_LENGTH;
    }
    const outputs = new Array<RoomPosition>(totalStepLength);
    let lastOffset = 0;
    for (let i = 0, n = pathChunks.length; i < n; ++i) {
      const chunk = pathChunks[i];
      const roomName = chunk.substr(0, ROOM_TAG_LENGTH).trim();
      for (let p = 0, np = chunk.length - ROOM_TAG_LENGTH; p < np; ++p) {
        outputs[lastOffset + p] = Wayfarer.roomPosFromUnicode(chunk[ROOM_TAG_LENGTH + p], roomName);
      }
      lastOffset += chunk.length - ROOM_TAG_LENGTH;
    }
    return outputs;
  }

  public static deserializePathStep(this: void, pathChunks: string[], step: number): RoomPosition | undefined {
    let chosenPathChunk: string | undefined;
    for (let i = 0, n = pathChunks.length; i < n; ++i) {
      const chunk = pathChunks[i];
      if (chunk.length - ROOM_TAG_LENGTH < step) {
        step -= (chunk.length - ROOM_TAG_LENGTH);
      } else {
        chosenPathChunk = chunk;
        break;
      }
    }
    if (chosenPathChunk === undefined) {
      return undefined;//Step was at a larger index than the path contained
    }
    const roomName = chosenPathChunk.substr(0, ROOM_TAG_LENGTH).trim();
    return Wayfarer.roomPosFromUnicode(chosenPathChunk[step + ROOM_TAG_LENGTH], roomName);
  }
}
