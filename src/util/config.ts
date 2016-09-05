export class DefaultConfig {
    public static apply(config: CoreConfiguration | undefined): CoreConfiguration {
        const defaultConfig: CoreConfiguration = {
            noisy: false,
            profile: false,
            minersRepair: false,
            repairerMultiplier: 1,
            builderMultiplier: 1,
            upgraderMultiplier: 1,
            courierMultiplier: 1,
        };
        
        if (config === undefined) {
            config = defaultConfig;
            return config;
        }

        return _.defaults<CoreConfiguration>(config, defaultConfig);
    }
}
