
export class RoleListing {
    public static initialize(): void {
        const map = new Map<string, Creep[]>();
        const all = new Array<Creep>();
        const roomMap = new Map<string, Creep>();
        for (let creepName in Game.creeps) {
            const creep = Game.creeps[creepName];
            if (creep === undefined || creep.role === undefined || creep.role === null) {
                continue;
            }
            let mapEntry = map.get(creep.role);
            if (mapEntry === undefined) {
                map.set(creep.role, [creep]);
            } else {
                mapEntry.push(creep);
            }
        }
        RoleListing._all = all;
        RoleListing._map = map;
    }

    private static get listingStore(): { all?: Creep[]; map?: Map<string, Creep[]>; } {
        return TickVolatile["RoleListing"] || (TickVolatile["RoleListing"] = {});
    }

    private static get _all(): Creep[] | undefined {
        const listingStore = RoleListing.listingStore;
        return listingStore.all;
    }

    private static set _all(value: Creep[] | undefined) {
        const listingStore = RoleListing.listingStore;
        listingStore.all = value;
    }

    private static get _map(): Map<string, Creep[]> | undefined {
        const listingStore = RoleListing.listingStore;
        return listingStore.map;
    }

    private static set _map(value: Map<string, Creep[]> | undefined) {
        const listingStore = RoleListing.listingStore;
        listingStore.map = value;
    }

    private static EmptyArray = [];

    public static getAllCreeps(): Iterable<Creep> & ArrayLike<Creep> {
        let listing = RoleListing._all;
        if (listing === undefined) {
            RoleListing.initialize();
            listing = <Creep[]>RoleListing._all;
        }
        return listing;
    }

    public static getByRole(roleOrRoleTag: string | { RoleTag: string }): Iterable<Creep> & ArrayLike<Creep> {
        let mapping = RoleListing._map;
        if (mapping === undefined) {
            RoleListing.initialize();
            mapping = <Map<string, Creep[]>>RoleListing._map;
        }
        const roleEntry = mapping.get(typeof roleOrRoleTag === "string" ? roleOrRoleTag : roleOrRoleTag.RoleTag);
        if (roleEntry === undefined) {
            return RoleListing.EmptyArray;
        }
        return roleEntry;
    }

    public static *getByRoles(...rolesOrRoleTags: (string | { RoleTag: string })[]): IterableIterator<Creep> {
        let mapping = RoleListing._map;
        if (mapping === undefined) {
            RoleListing.initialize();
            mapping = <Map<string, Creep[]>>RoleListing._map;
        }
        for (let roleOrRoleTag of rolesOrRoleTags) {
            const roleEntry = mapping.get(typeof roleOrRoleTag === "string" ? roleOrRoleTag : roleOrRoleTag.RoleTag);
            if (roleEntry === undefined) {
                continue;
            }
            yield* roleEntry;
        }
    }
}
