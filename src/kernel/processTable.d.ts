interface ProcessMemory {
}

type SerializedProcess = {
	pid: ProcessId;
	parentPid: ProcessId;
	heat: number;
	service: boolean;
	className: string;
};

interface SerializedProcessTable extends Array<SerializedProcess | null | undefined> {
}

interface Memory extends KernelMemory {
}
