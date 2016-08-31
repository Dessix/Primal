export class DefaultConfig {
    public static apply(config: CoreConfiguration | undefined): CoreConfiguration {
        const defaultConfig: CoreConfiguration = {
            noisy: false,
            profile: false,
            minersRepair: false,
        };
        
        if (config === undefined) {
            config = defaultConfig;
            return config;
        }

        return _.defaults<CoreConfiguration>(config, defaultConfig);
    }
}
