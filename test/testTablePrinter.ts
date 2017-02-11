import { TablePrinter } from "../src/util/tablePrinter";

import * as _ from "lodash";
import { assert, expect } from "chai";

declare const global: any;
global._ = _;

describe("Table Printer", () => {
  describe("Text", () => {
    it("Should output formatted text", () => {
      const table = TablePrinter.createTable([
				{a: 1, b: 2, c: 3},
				{a: 4, b: 5, c: 63},
			]);
			console.log(table);
			//assert.sameMembers(Object.values({ x: 1, y: 2, 3: 5 }), [1, 2, 5], "All values are fetched");
      //assert.deepEqual(Object.values({ x: 1, y: 2, 3: 2, 4: 2 }).sort(), [1, 2, 2, 2], "Duplicates are included");
    });
  });
});
