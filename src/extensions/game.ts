
function flaggedGetObjectById<T>(id: string): T | null {
    if (id.startsWith("flag-")) {
        return <T><Object>Game.flags[id.substr(5)];
    } else {
        return Game.getObjectById<T>(id);
    }
}

global.getObjectOrFlagById = flaggedGetObjectById;
