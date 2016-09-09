
function flaggedGetObjectById<T>(id: string | null | undefined): T | undefined {
    if (id === null || id === undefined) {
        return undefined;
    } if (id.startsWith("flag-")) {
        const flag = <T | undefined><Object>Game.flags[id.substr(5)];
        return flag;
    } else {
        return Game.getObjectById<T>(id) || undefined;
    }
}

global.fromId = flaggedGetObjectById;
