import { Process } from "./process";

export class ProcessRegistry {
    private static readonly registry = new Map<string, ProcessConstructor>();
    private static readonly inverseRegistry = new Map<ProcessConstructor, string>();

    public static register(className: string, constructor: ProcessConstructor): void {
        ProcessRegistry.registry.set(className, constructor);
        ProcessRegistry.inverseRegistry.set(constructor, className);
    }

    public static fetch(className: string): ProcessConstructor | undefined {
        return ProcessRegistry.registry.get(className);
    }

    public static fetchClassNameFor(constructor: ProcessConstructor): string | undefined {
        return ProcessRegistry.inverseRegistry.get(constructor);
    }
}
