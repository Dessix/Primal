interface ProcessMemory {

}
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
    proc?: SerializedProcessTable;
    pmem?: { [pid: number /*ProcessId*/]: ProcessMemory | undefined };
}
