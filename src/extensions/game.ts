
function flaggedGetObjectById<T>(id: string | null | undefined): T | null {
    if (id === null || id === undefined) {
        return null;
    } if (id.startsWith("flag-")) {
        const flag = <T | undefined><Object>Game.flags[id.substr(5)];
        return flag !== undefined ? flag : null;
    } else {
        return Game.getObjectById<T>(id);
    }
}

global.fromId = flaggedGetObjectById;
