
declare type LogLevels = {
  readonly Debug: "debug";
  readonly Info: "info";
  readonly Warning: "warning";
  readonly Error: "error";
  readonly Fatal: "fatal";
  readonly Apocalyptic: "apocalyptic";
};

declare const LogLevel: LogLevels;

declare type LogLevel = (
  | typeof LogLevel.Debug
  | typeof LogLevel.Info
  | typeof LogLevel.Warning
  | typeof LogLevel.Error
  | typeof LogLevel.Fatal
  | typeof LogLevel.Apocalyptic
);

declare type LogLevel_Severity = (
  & Record<typeof LogLevel.Debug, 0>
  & Record<typeof LogLevel.Info, 1>
  & Record<typeof LogLevel.Warning, 2>
  & Record<typeof LogLevel.Error, 3>
  & Record<typeof LogLevel.Fatal, 4>
  & Record<typeof LogLevel.Apocalyptic, 5>
);

declare const LogLevel_Severity: LogLevel_Severity;
declare interface ILogger {
  log(logLevel: LogLevel, message: string): void;
  log(logLevel: LogLevel, message: string, color: COLOR): void;
  log(logLevel: LogLevel, message: string, color: COLOR, highlight: boolean): void;
}
