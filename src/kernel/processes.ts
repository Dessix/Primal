import { PRoot } from "../processes/root";
import { PBootstrap } from "../processes/bootstrap";
import { PHarvest } from "../processes/harvest";
import { PHello } from "../processes/hello";
import { PUpgrade } from "../processes/upgrade";
import { ProcessRegistry } from "./../kernel/processRegistry";
import { Process, ProcessConstructor } from "./../kernel/process";

interface ProcWithStatic {
    className: string;
}

export class Processes {
    public static readonly ProcessClasses = <(ProcessConstructor & { Register(className: string, processCtor: ProcessConstructor): void, className: string })[]>[
        PRoot,
        PHello,
        PHarvest,
        PUpgrade,
        PBootstrap,
    ];

    public static RegisterAll(): void {
        //Register each process builder
        for (let t of Processes.ProcessClasses) {
            t.Register(t.className, t);
        }
    }
}
