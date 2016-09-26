export default function ApplyConfigToMemory(global: Global, memory: Memory): void {
    const defaultConfig: CoreConfiguration = {
        noisy: false,
        profile: false,

        boostrapsRepair: true,
        
        nRepr: 1,
        nBild: 1,
        nUpgr: 1,
        nCrr: 1,
    };

    let config: CoreConfiguration | undefined = memory.config;
    if (config == null) {
        Memory.config = config = defaultConfig;
    } else {
        _.defaults<CoreConfiguration>(config, defaultConfig);
    }
    if (global.config == null) {
        global.config = config;
    }
}
