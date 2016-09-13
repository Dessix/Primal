export class TablePrinter {

  public static createTable(data: Array<Array<Object> | Object>, widths?: number[]): string {
    let leftTopCorner = "╔";
    let rightTopCorner = "╗";
    let leftBottomCorner = "╚";
    let rightBottomCorner = "╝";
    let hBar = "═";
    let vBar = "║";
    let hSBar = "─";
    let vSBar = "│";
    let bottomDSTee = "╧";
    let topDSTee = "╤";
    let rows = new Array<string>();
    let width = 0;
    if (widths === undefined || widths.length === 0) {
      const _widths = widths = new Array<number>();
      data.forEach(row => {
        _.values(row).forEach((v, i) => {
          // console.log(v,i)
          if (_widths[i]) { _widths[i] = 0; }
          _widths[i] = Math.max(v.toString().length, _widths[i]);
        });
      });
      console.log(widths);
    }
    data.forEach(d => {
      const _widths = <number[]>widths;
      let arr = d instanceof Array ? d : _.values(d);
      let r = `${vBar} ` + arr.map((v, i) => (" ".repeat(_widths[i]) + v).slice(-_widths[i])).join(` ${vSBar} `) + ` ${vBar}`;
      width = r.length;
      rows.push(r);
    });
    let topBar = widths.map(w => hBar.repeat(w + 2)).join(topDSTee);
    let bottomBar = widths.map(w => hBar.repeat(w + 2)).join(bottomDSTee);
    rows.unshift(`${leftTopCorner}${topBar}${rightTopCorner}`);
    rows.push(`${leftBottomCorner}${bottomBar}${rightBottomCorner}`);
    return rows.join("\n");
  }
}

// // Usage
// let globalStats = []
// globalStats.push(['GID', 'Start Tick', 'Last Tick', 'Elapsed'])
// for (let i in Memory.globals) {
//   let gd = Memory.globals[i]
//   let since = Game.time - gd.lastTick
//   if (since < 30)
//     globalStats.push([i, gd.firstTick, gd.lastTick, since])
// }
// console.log(`<span style="line-height: 1">\n${utils.table(globalStats)}\n</span>`)
