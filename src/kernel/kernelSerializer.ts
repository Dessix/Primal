import { SerializableProcessTable } from "./kernel";
import { Process } from "./process";
import { ProcessRegistry } from "./processRegistry";
import { BitComp } from "./../bitcomp";
/**
 * Handles serialization and deserialization of kernel memory
 */

export class KernelSerializer {

    public static createBlankProcessTable(): SerializedProcessTable {
        return { lastPidRun: -1, table: [] };
    }

    public static deserializeProcessTable(serializedProcessTable: SerializedProcessTable): SerializableProcessTable {
        const ptab = serializedProcessTable.table;
        const processTable: Process[] = new Array<Process>(ptab.length);
        for (let i = processTable.length; i-- > 0;) {
            const [pid, parentPid, className] = ptab[i];
            const processConstructor = ProcessRegistry.fetch(className);
            if (processConstructor === undefined) {
                processTable.splice(i);//we're heading backwards, so this won't mess with iteration
                console.log(`Error: No constructor found for process class "${className}"!`);
            } else {
                processTable[i] = new processConstructor(pid, parentPid);
            }
        }
        return {
            lastPidRun: serializedProcessTable.lastPidRun,
            table: processTable,
        };
    }

    public static serializeProcessTable(processTable: SerializableProcessTable): SerializedProcessTable {
        const ptab = processTable.table;
        const output = new Array<SerializedProcess>(ptab.length);
        for (let i = ptab.length; i-- > 0;) {
            const process = ptab[i];
            output[i] = [process.pid, process.parentPid, process.className];
        }
        return {
            lastPidRun: processTable.lastPidRun,
            table: output,
        };
    }
}
