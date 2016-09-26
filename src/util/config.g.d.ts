interface CoreConfiguration {
  noisy: boolean;
  profile: boolean;
  boostrapsRepair: boolean;
  nBild: number;
  nUpgr: number;
  nRepr: number;
  nCrr: number;
}

interface Memory {
  config: CoreConfiguration;
}

interface Global {
  config: CoreConfiguration;
}
