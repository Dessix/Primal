interface Memory {
    sources?: { [roomName: string]: SourceScanInfo | undefined };
}

interface SourceInfo {
    id: string;
    position: {
        x: number;
        y: number;
    };
    miningPosition: {
        x: number;
        y: number;
    };
}

interface SourceScanInfo {
    roomName: string;
    sources: Array<SourceInfo>;
    lastSourceIndex: number;
}
