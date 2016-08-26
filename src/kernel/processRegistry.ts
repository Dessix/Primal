import { Process } from "./process";

type ProcessBuilder = (pid: ProcessId, parentPid: ProcessId) => Process;

export class ProcessRegistry {
    private static readonly registry = new Map<string, ProcessBuilder>();

    public static register(className: string, constructor: ProcessBuilder): void {
        ProcessRegistry.registry.set(className, constructor);
    }

    public static fetch(className: string): ProcessBuilder | undefined {
        return ProcessRegistry.registry.get(className);
    }
}
