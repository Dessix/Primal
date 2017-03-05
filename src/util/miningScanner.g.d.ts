interface Memory {
    sources?: { [roomName: string]: SourceScanInfo | undefined };
}

interface SourceInfo {
    id: string;
    position: PointLike;
    miningPosition: PointLike;
}

interface SourceScanInfo {
    roomName: string;
    sources: Array<SourceInfo>;
    lastSourceIndex: number;
}
