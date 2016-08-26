type ProcessMemory = Object;
type ProcessId = number;
type SerializedProcess = [ProcessId, ProcessId, string];

interface SerializedProcessTable {
    lastPidRun: number;
    table: Array<SerializedProcess>;
}

interface Memory {
    proc: SerializedProcessTable | undefined;
    pmem: { [pid: number /*ProcessId*/]: ProcessMemory | undefined } | undefined;
}
