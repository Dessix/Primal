interface ProcessMemory {
}

type SerializedProcess = {
	id: ProcessId;
	pa: ProcessId;
	he: number;
	se: boolean;
	ex: string;
};

type SerializedProcessTable = SerializedProcess[];
