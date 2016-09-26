import { ProcessRegistry } from "./processRegistry";

/**
 * Handles serialization and deserialization of kernel memory
 */
export class KernelSerializer {

    public static createBlankProcessTable(): SerializedProcessTable {
        return [];
    }

    public static deserializeProcessTable(serializedProcessTable: SerializedProcessTable): SerializableProcessTable {
        const processTable: SerializableProcessTable = new Array<SerializableProcessTableEntry>(serializedProcessTable.length);
        for (let i = processTable.length; i-- > 0;) {
            const serialized = serializedProcessTable[i];
            if (serialized === undefined || serialized === null) {
                continue;
            }
            const {className: className, heat: heat, service: service, pid: pid, parentPid: parentPid } = serialized;

            const processConstructor = ProcessRegistry.fetch(className);
            if (processConstructor === undefined) {
                processTable.splice(i);//we're heading backwards, so this won't mess with iteration
                console.log(`Error: No constructor found for process class "${className}"!`);
            } else {
                const entry: SerializableProcessTableEntry = {
                    pid: pid,
                    parentPid: parentPid,
                    processCtor: processConstructor,
                    heat: heat,
                    service: service,
                };
                processTable[i] = entry;
            }
        }
        return processTable;
    }

    public static serializeProcessTable(processTable: SerializableProcessTable): SerializedProcessTable {
        const output = new Array<SerializedProcess>(processTable.length);
        for (let i = processTable.length; i-- > 0;) {
            const record = processTable[i];
            if (record === null || record === undefined) {
                continue;//Skip blanks
            }
            const className = ProcessRegistry.fetchClassNameFor(record.processCtor);
            if (className === undefined) {
                continue;
            }
            const produced: SerializedProcess = {
                pid: record.pid,
                parentPid: record.parentPid,
                className: className,
                heat: record.heat,
                service: record.service,
            };
            output[i] = produced;
        }
        return output;
    }

    public static spawnNewProcessTable() {
        const processTable = KernelSerializer.createBlankProcessTable();
        const procInst: SerializedProcess = {
            className: "Root",
            pid: 0,
            parentPid: 0,
            heat: 1000,
            service: true,
        };
        processTable.push(procInst);
        return processTable;
    }
}
