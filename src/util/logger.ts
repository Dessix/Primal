export function ScreepsColorToHex(color: COLOR): string {
  switch (color) {
    case COLOR_BLUE: return "0000FF";
    case COLOR_BROWN: return "A14E00";
    case COLOR_CYAN: return "00FFFF";
    case COLOR_GREEN: return "00FF00";
    case COLOR_GREY: return "999999";
    case COLOR_ORANGE: return "E67A00";
    case COLOR_PURPLE: return "A100E6";
    case COLOR_RED: return "FF0000";
    case COLOR_WHITE: return "FFFFFF";
    case COLOR_YELLOW: return "FFFF00";
    default: throw new RangeError("Not a valid color.");
  }
}

export class BaseLogger implements ILogger {
  public log(logLevel: LogLevel, message: string, color?: COLOR, highlight?: boolean): void {
    const l = console.log, lls = logLevel.toUpperCase();
    let c: string;
    if (color !== undefined) {
      c = ` color=\"#${ScreepsColorToHex(color)}\"`;
    } else {
      c = "";
    }
    /** TODO: html-entities on {message} */
    l("<font%s severity=\"%i\"%s>%s</font>", c, (LogLevel_Severity[logLevel] as number), highlight ? " type=\"highlight\"" : "", message);
  }
}

export const StaticLogger = new BaseLogger();
