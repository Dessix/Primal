import { Process } from "./process";

export class ProcessRegistry {
    private static readonly registry: { [procName: string]: ProcessConstructor | undefined } = {};
    
    public static get registations(): Readonly<typeof ProcessRegistry.registry> {
        return <Readonly<typeof ProcessRegistry.registry>>this.registry;
    }

    public static register(ctor: ProcessConstructor): void {
        ProcessRegistry.registry[ctor.className] = ctor;
    }

    public static fetch(className: string): ProcessConstructor | undefined {
        return ProcessRegistry.registry[className];
    }
}
