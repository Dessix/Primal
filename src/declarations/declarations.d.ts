declare type CreepBodyPart =
    typeof MOVE
    | typeof WORK
    | typeof CARRY
    | typeof ATTACK
    | typeof RANGED_ATTACK
    | typeof TOUGH
    | typeof HEAL
    | typeof CLAIM;

declare const enum Direction {
    TOP = 1,
    TOP_RIGHT = 2,
    RIGHT = 3,
    BOTTOM_RIGHT = 4,
    BOTTOM = 5,
    BOTTOM_LEFT = 6,
    LEFT = 7,
    TOP_LEFT = 8,
}
