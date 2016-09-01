type ProcessMemory = Object;
type ProcessId = number;

type SerializedProcess = {
    pid: ProcessId;
    parentPid: ProcessId;
    heat: number;
    service: boolean;
    className: string;
};

interface SerializedProcessTable extends Array<SerializedProcess> {
}

interface Memory {
    proc: SerializedProcessTable | undefined;
    pmem: { [pid: number /*ProcessId*/]: ProcessMemory | undefined } | undefined;
}
