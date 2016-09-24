export interface BaseCreep extends Array<CreepBodyPart> {
}

interface BodyOpts {
  travel?: TravelCondition;
  maxCarry?: number;
  maxMove?: number;
  maxWork?: number;
}

export class BodyBuilder {
  private static bodyCost(body: CreepBodyPart[]) {
    let cost = 0;
    for (let i = 0, n = body.length; i < n; ++i) {
      cost += BODYPART_COST[body[i]];
    }
    return cost;
  }
  
  private static fatiguePerMove(body: CreepBodyPart[], travelCondition: TravelCondition) {
    //TODO: account for boosts
    let terrainFactor: number;
    switch (travelCondition) {
      case TravelCondition.road:
        terrainFactor = 1;
        break;
      case TravelCondition.plain:
        terrainFactor = 2;
        break;
      case TravelCondition.swamp:
        terrainFactor = 10;
        break;
      default:
        throw new Error("Invalid terrain condition");
    }
    const moveCount = body.count(MOVE);
    return (body.length - moveCount) * terrainFactor - moveCount * 2;
  }

  public static buildCreepBody(
    maxCost: number,
    base: CreepBodyPart[],
    grow: CreepBodyPart[],
    opts?: BodyOpts
  ): CreepBodyPart[] {
    const output = new Array<CreepBodyPart>();
    const baseCost = this.bodyCost(base);

    let lastValid: Array<CreepBodyPart>;
    let prevBody = base.slice();
    let curCost: number;
    while (true) {
      let fatiguePerMove = this.fatiguePerMove(
      if (curCost = this.bodyCost(prevBody)
    }
  }
}
