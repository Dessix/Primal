interface Global {
  LogLevel: LogLevels;
  LogLevel_Severity: LogLevel_Severity;
}

global.LogLevel = {
  Debug: "debug",
  Info: "info",
  Warning: "warning",
  Error: "error",
  Fatal: "fatal",
  Apocalyptic: "apocalyptic",
};

global.LogLevel_Severity = {
  debug: 0,
  info: 1,
  warning: 2,
  error: 3,
  fatal: 4,
  apocalyptic: 5
};
