type Anyhash = { [key: string]: any, [key: number]: any };
type Stringable = { toString(): string };

export class TablePrinter {

	public static createTable(data: Array<Anyhash>, widths?: Anyhash): string {
		let
			[leftTopCorner, rightTopCorner, leftBottomCorner, rightBottomCorner] = ["╔", "╗", "╚", "╝"],
			[hBar, vBar, hSBar, vSBar] = ["═", "║", "─", "│"],
			[bottomDSTee, topDSTee, centerS] = ["╧", "╤", "┼"];

		const contents = _.map(data, function (row, rowIndex) {
			return _.map(row, function (col: Stringable | null | undefined, colIndex) {
				if(col !== null && col !== undefined) {
					return col.toString();
				} else {
					return col;
				}
			});
		});

		console.log(contents);
		contents.reduce(function(acc: { [key: string]: number }, item) {
					if(item == null) { continue; }
					const saved = acc[itemKey];
					if(saved !== null && saved !== undefined) {
						acc[itemKey] = Math.max(saved, item.length);
					}
					return acc;
				}
			});
		widths = widths || _.assign({}, contents, function (memo: number | null | undefined, sourceValue: string | null | undefined): any {
			if(!sourceValue) { return memo; }
			if(!memo) {
				return sourceValue.length;
			} else {
				return Math.max(memo, sourceValue.length);
			}
		});
		console.log(widths);

		const keyOrder = Object.keys(widths);
		const nColumns = keyOrder.length, tWidth = _.sum(widths) + (nColumns - 1) * 3;
		const outRows = new Array<string>(data.length);
		const rows = data;
		for(let rowI = 0, rowCount = rows.length; rowI < rowCount; ++rowI) {
			const row = rows[rowI];
			const value = _(row).at(keyOrder).map(function (s: string, i: number) {
				const _widths = (<{ [key: string]: number }>widths);
				return _.padRight(s, _widths[keyOrder[i]], " ");
			}).join(` ${vSBar} `);
			outRows[rowI] = `${vBar} ${value} ${vBar}`;
		}
		const firstRow = `${leftTopCorner}${hBar.repeat(tWidth + 2)}${rightTopCorner}`;
		const lastRow = `${leftBottomCorner}${hBar.repeat(tWidth + 2)}${rightBottomCorner}`;
		const innerRow = `${vBar}${_(widths).at(keyOrder).map(function (this: string, n: number) {
			return this.repeat(n + 2);
		}, hSBar).join(centerS)}${vBar}`;
		const body = outRows.join(`\n${innerRow}\n`);
		return `${firstRow}\n${body}\n${lastRow}`;
	}
}

// // Usage
// let globalStats = []
// globalStats.push(['GID', 'Start Tick', 'Last Tick', 'Elapsed'])
// for (let i of Object.keys(Memory.globals)) {
//   let gd = Memory.globals[i]
//   let since = Game.time - gd.lastTick
//   if (since < 30)
//     globalStats.push([i, gd.firstTick, gd.lastTick, since])
// }
// console.log(`<span style="line-height: 1">\n${utils.table(globalStats)}\n</span>`)
