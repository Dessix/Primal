interface ProcessMemory {
}

type SerializedProcess = {
	pid: ProcessId;
	parentPid: ProcessId;
	heat: number;
	service: boolean;
	className: string;
};

interface SerializedProcessTable extends Array<SerializedProcess> {
}

//interface Memory extends KernelMemory { }
