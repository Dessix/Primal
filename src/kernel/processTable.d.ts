type ProcessMemory = any;
type ProcessId = number;
type SerializedProcessTable = Array<[ProcessId, ProcessId, string]>;
interface Memory {
    proc: SerializedProcessTable;
    procmem: { [pid: number /*ProcessId*/]: ProcessMemory | undefined };
}
