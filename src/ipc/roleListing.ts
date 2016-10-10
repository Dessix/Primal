
export class RoleListing {
    public static initialize(): void {
        const all = new Array<Creep>();
        const byRole = new Map<string, Creep[]>();
        const byRoom = new Map<string, Creep[]>();
        for (let creepName in Game.creeps) {
            const creep = Game.creeps[creepName];
            if (creep === undefined || creep.role === undefined || creep.role === null) {
                continue;
            }
            const mapEntry = byRole.get(creep.role);
            if (mapEntry === undefined) {
                byRole.set(creep.role, [creep]);
            } else {
                mapEntry.push(creep);
            }
            const roomEntry = byRole.get(creep.role);
            if (roomEntry === undefined) {
                byRoom.set(creep.homeRoomName, [creep]);
            } else {
                roomEntry.push(creep);
            }
        }
        RoleListing._all = all;
        RoleListing._byRole = byRole;
        RoleListing._byRoom = byRoom;
    }

    private static get listingStore(): { all?: Creep[]; byRole?: Map<string, Creep[]>; byRoom?: Map<string, Creep[]>; } {
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

    private static get _byRole(): Map<string, Creep[]> | undefined {
        const listingStore = RoleListing.listingStore;
        return listingStore.byRole;
    }

    private static set _byRole(value: Map<string, Creep[]> | undefined) {
        const listingStore = RoleListing.listingStore;
        listingStore.byRole = value;
    }

    private static get _byRoom(): Map<string, Creep[]> | undefined {
        const listingStore = RoleListing.listingStore;
        return listingStore.byRoom;
    }

    private static set _byRoom(value: Map<string, Creep[]> | undefined) {
        const listingStore = RoleListing.listingStore;
        listingStore.byRoom = value;
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
        let mapping = RoleListing._byRole;
        if (mapping === undefined) {
            RoleListing.initialize();
            mapping = <Map<string, Creep[]>>RoleListing._byRole;
        }
        const roleEntry = mapping.get(typeof roleOrRoleTag === "string" ? roleOrRoleTag : roleOrRoleTag.RoleTag);
        if (roleEntry === undefined) {
            return RoleListing.EmptyArray;
        }
        return roleEntry;
    }

    public static *getByRoles(...rolesOrRoleTags: (string | { RoleTag: string })[]): IterableIterator<Creep> {
        let mapping = RoleListing._byRole;
        if (mapping === undefined) {
            RoleListing.initialize();
            mapping = <Map<string, Creep[]>>RoleListing._byRole;
        }
        for (let roleOrRoleTag of rolesOrRoleTags) {
            const roleEntry = mapping.get(typeof roleOrRoleTag === "string" ? roleOrRoleTag : roleOrRoleTag.RoleTag);
            if (roleEntry === undefined) {
                continue;
            }
            yield* roleEntry;
        }
    }

    public static getByRoom(roomOrRoomName: Room | string): Iterable<Creep> & ArrayLike<Creep> {
        let byRoom = RoleListing._byRoom;
        if (byRoom === undefined) {
            RoleListing.initialize();
            byRoom = <Map<string, Creep[]>>RoleListing._byRoom;
        }
        const roomEntry = byRoom.get(roomOrRoomName instanceof Room ? roomOrRoomName.name : roomOrRoomName);
        if (roomEntry === undefined) {
            return RoleListing.EmptyArray;
        }
        return roomEntry;
    }

    public static *getByRooms(...roomsOrRoomNames: (Room | string)[]): IterableIterator<Creep> {
        let byRoom = RoleListing._byRoom;
        if (byRoom === undefined) {
            RoleListing.initialize();
            byRoom = <Map<string, Creep[]>>RoleListing._byRoom;
        }
        for (let roomOrRoomName of roomsOrRoomNames) {
            const roomEntry = byRoom.get(roomOrRoomName instanceof Room ? roomOrRoomName.name : roomOrRoomName);
            if (roomEntry === undefined) {
                continue;
            }
            yield* roomEntry;
        }
    }
}
