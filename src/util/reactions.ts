export const Reagents: { [resourceNameToSources: string]: string[] } = {};
const reactions: { [reagent: string]: { [reagent: string]: string } } = REACTIONS;
for (let first of Object.keys(reactions)) {
    for (let second of Object.keys(reactions[first])) {
        Reagents[reactions[first][second]] = [first, second];
    }
}

/*
// TIER III
reactions[RESOURCE_CATALYZED_UTRIUM_ACID] = [RESOURCE_UTRIUM_ACID, RESOURCE_CATALYST];
reactions[RESOURCE_CATALYZED_UTRIUM_ALKALIDE] = [RESOURCE_UTRIUM_ALKALIDE, RESOURCE_CATALYST];
reactions[RESOURCE_CATALYZED_KEANIUM_ACID] = [RESOURCE_KEANIUM_ACID, RESOURCE_CATALYST];
reactions[RESOURCE_CATALYZED_KEANIUM_ALKALIDE] = [RESOURCE_KEANIUM_ALKALIDE, RESOURCE_CATALYST];
reactions[RESOURCE_CATALYZED_LEMERGIUM_ACID] = [RESOURCE_LEMERGIUM_ACID, RESOURCE_CATALYST];
reactions[RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE] = [RESOURCE_LEMERGIUM_ALKALIDE, RESOURCE_CATALYST];
reactions[RESOURCE_CATALYZED_ZYNTHIUM_ACID] = [RESOURCE_ZYNTHIUM_ACID, RESOURCE_CATALYST];
reactions[RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE] = [RESOURCE_ZYNTHIUM_ALKALIDE, RESOURCE_CATALYST];
reactions[RESOURCE_CATALYZED_GHODIUM_ACID] = [RESOURCE_GHODIUM_ACID, RESOURCE_CATALYST];
reactions[RESOURCE_CATALYZED_GHODIUM_ALKALIDE] = [RESOURCE_GHODIUM_ALKALIDE, RESOURCE_CATALYST];

// TIER II
reactions[RESOURCE_UTRIUM_ACID] = [RESOURCE_UTRIUM_HYDRIDE, RESOURCE_HYDROXIDE];
reactions[RESOURCE_UTRIUM_ALKALIDE] = [RESOURCE_UTRIUM_OXIDE, RESOURCE_HYDROXIDE];
reactions[RESOURCE_KEANIUM_ACID] = [RESOURCE_KEANIUM_HYDRIDE, RESOURCE_HYDROXIDE];
reactions[RESOURCE_KEANIUM_ALKALIDE] = [RESOURCE_KEANIUM_OXIDE, RESOURCE_HYDROXIDE];
reactions[RESOURCE_LEMERGIUM_ACID] = [RESOURCE_LEMERGIUM_HYDRIDE, RESOURCE_HYDROXIDE];
reactions[RESOURCE_LEMERGIUM_ALKALIDE] = [RESOURCE_LEMERGIUM_OXIDE, RESOURCE_HYDROXIDE];
reactions[RESOURCE_ZYNTHIUM_ACID] = [RESOURCE_ZYNTHIUM_HYDRIDE, RESOURCE_HYDROXIDE];
reactions[RESOURCE_ZYNTHIUM_ALKALIDE] = [RESOURCE_ZYNTHIUM_OXIDE, RESOURCE_HYDROXIDE];
reactions[RESOURCE_GHODIUM_ACID] = [RESOURCE_GHODIUM_HYDRIDE, RESOURCE_HYDROXIDE];
reactions[RESOURCE_GHODIUM_ALKALIDE] = [RESOURCE_GHODIUM_OXIDE, RESOURCE_HYDROXIDE];


// TIER I
reactions[RESOURCE_UTRIUM_HYDRIDE] = [RESOURCE_UTRIUM, RESOURCE_HYDROGEN];
reactions[RESOURCE_UTRIUM_OXIDE] = [RESOURCE_UTRIUM, RESOURCE_OXYGEN];
reactions[RESOURCE_KEANIUM_HYDRIDE] = [RESOURCE_KEANIUM, RESOURCE_HYDROGEN];
reactions[RESOURCE_KEANIUM_OXIDE] = [RESOURCE_KEANIUM, RESOURCE_OXYGEN];
reactions[RESOURCE_LEMERGIUM_HYDRIDE] = [RESOURCE_LEMERGIUM, RESOURCE_HYDROGEN];
reactions[RESOURCE_LEMERGIUM_OXIDE] = [RESOURCE_LEMERGIUM, RESOURCE_OXYGEN];
reactions[RESOURCE_ZYNTHIUM_HYDRIDE] = [RESOURCE_ZYNTHIUM, RESOURCE_HYDROGEN];
reactions[RESOURCE_ZYNTHIUM_OXIDE] = [RESOURCE_ZYNTHIUM, RESOURCE_OXYGEN];
reactions[RESOURCE_GHODIUM_HYDRIDE] = [RESOURCE_GHODIUM, RESOURCE_HYDROGEN];
reactions[RESOURCE_GHODIUM_OXIDE] = [RESOURCE_GHODIUM, RESOURCE_OXYGEN];

// TIER 0
reactions[RESOURCE_HYDROXIDE] = [RESOURCE_HYDROGEN, RESOURCE_OXYGEN];
reactions[RESOURCE_GHODIUM] = [RESOURCE_ZYNTHIUM_KEANITE, RESOURCE_UTRIUM_LEMERGITE];
reactions[RESOURCE_ZYNTHIUM_KEANITE] = [RESOURCE_ZYNTHIUM, RESOURCE_KEANIUM];
reactions[RESOURCE_UTRIUM_LEMERGITE] = [RESOURCE_UTRIUM, RESOURCE_LEMERGIUM];
*/
