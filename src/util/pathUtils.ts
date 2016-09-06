
export class PathUtils {
    public static SerializePath(path: RoomPosition[]): string {
        const output = new Array<String>(path.length);
        let currentRoomName: string | undefined;
        for (let i = 0, n = path.length; i < n; ++i) {
            const step = path[i];
            if (currentRoomName === step.roomName) {
                output[i] = `${step.x.toString(36)},${step.y.toString(36)}`;
            } else {
                currentRoomName = step.roomName;
                output[i] = `${step.x.toString(36)},${step.y.toString(36)},${currentRoomName}`;
            }
        }
        return output.join(";");
    }

    public static DeserializePath(encoded: string): RoomPosition[] | undefined {
        try {
            const split = encoded.split(";");
            const output = new Array<RoomPosition>(split.length);
            let lastReadRoomName: string | undefined;
            for (let i = 0, n = split.length; i < n; ++i) {
                const [x, y, roomName] = split[i].split(",");
                if (roomName !== undefined) {
                    lastReadRoomName = roomName;
                }
                if (lastReadRoomName === undefined) {
                    throw new Error("Format incorrect on path- did not start with a leading room");
                }
                output[i] = new RoomPosition(Number.parseInt(x, 36), Number.parseInt(y, 36), lastReadRoomName);
            }
            return output;
        } catch (e) {
            return;
        }
    }
}
