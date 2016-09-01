/**
 * Uniform screep's world position with E0S0 as origin.
 */
export class WorldPosition {
    /** @property int x */
    /** @property int y */

	/**
	 * @params {Object} point
	 * @params {number} point.x - world position x (-3025 to 3025)
	 * @params {number} point.y - world position y (-3025 to 3025)
	 */
    constructor(x: number, y: number);

	/**
	 * @params {Object} point
	 * @params {number} point.x
	 * @params {number} point.y
	 */
    getRangeTo(point: { x: number, y: number }): number;

	/**
	 * @params {number} x
	 * @params {number} y
	 */
    getRangeToXY(this: WorldPosition, x: number, y: number): number

    inRangeTo(this: WorldPosition, pos: { x: number, y: number }, range: number): boolean;

    inRangeToXY(this: WorldPosition, x: number, y: number, range: number): boolean;

    getDirectionTo(this: WorldPosition, point: { x: number, y: number }): number;

	/**
	 * @params {number} x - world coordinate x
	 * @params {number} y - world coordinate y
	 *   ..don't question it. don't even think about it.
	 */
    getDirectionToXY(this: WorldPosition, x: number, y: number): number;

    findRouteToWorldPosition(this: WorldPosition, pos: { x: number, y: number }, opts?: {
        routeCallback: {
            (roomName: string, fromRoomName: string): any;
        };
    }): {
        exit: string;
        room: string;
    }[] | number;

    findPathToWorldPosition(this: WorldPosition, pos: WorldPosition, opts?: PathFinderOpts): {
        path: RoomPosition[];
        ops: number;
    };

    /** @returns String - name of the room this point belongs to */
    getRoomName(this: WorldPosition): string;

    /** @returns boolean - do we have visibility in the room this point belongs to? */
    isVisible(this: WorldPosition): boolean;

    /** @returns boolean - is this room part of the highways between sectors? */
    isHighway(this: WorldPosition): boolean;

    /** Distance functions */

	/**
	 * @params {Object} point
	 * @params {number} point.x
	 * @params {number} point.y
	 */
    getEuclidDist(this: WorldPosition, pos: { x: number, y: number }): number;

	/**
	 * @params {Object} point
	 * @params {number} point.x
	 * @params {number} point.y
	 */
    getManhattanDist(this: WorldPosition, pos: { x: number, y: number }): number;

    // yeah. and with that, it'll give you the correct distance of diagonals, whereas manhattan won't consider that.
	/**
	 * @params {Object} point
	 * @params {number} point.x
	 * @params {number} point.y
	 */
    getChebyshevDist(this: WorldPosition, x: number, y: number): number;

    /** serialization */
    serialize(this: WorldPosition): string

    static deserialize(str: string): WorldPosition

    /** [object WorldPosition] */
    [Symbol.toStringTag](): string;

	/**
	 * @params {RoomPosition} roomPos
	 * @params {number} roomPos.x
	 * @params {number} roomPos.y
	 * @params {String} roomPos.roomName
	 * @returns {WorldPosition}
	 */
    static fromRoomPosition(this: WorldPosition, roomPos: RoomPosition | { x: number, y: number, roomName: string }): WorldPosition

    toRoomPosition(this: WorldPosition): RoomPosition;

    /** [world pos 1275,1275] */
    toString(this: WorldPosition): string;
}

interface RoomObject {
    wpos: WorldPosition;
}

interface RoomPosition {
    toWorldPosition(this: RoomPosition): WorldPosition;
}
