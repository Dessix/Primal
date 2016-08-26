import { Process, ProcessConstructor } from "./process";

export class ProcessRegistry {
    private static readonly registry = new Map<string, ProcessConstructor>();

    public static register(className: string, constructor: ProcessConstructor): void {
        ProcessRegistry.registry.set(className, constructor);
    }

    public static fetch(className: string): ProcessConstructor | undefined {
        return ProcessRegistry.registry.get(className);
    }
}
