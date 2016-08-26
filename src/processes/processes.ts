import { PRoot } from "./root";
import { PBootstrap } from "./bootstrap";
import { PHarvest } from "./harvest";
import { PHello } from "./hello";
import { PUpgrade } from "./upgrade";
import { ProcessRegistry } from "./../kernel/processRegistry";
import { Process } from "./../kernel/process";

interface ProcWithStatic {
    className: string;
}

export class Processes {
    public static readonly ProcessClasses = [
        PRoot,
        PHello,
        PHarvest,
        PUpgrade,
        PBootstrap,
    ];
    public static RegisterAll(): void {
        //Register each process builder
        for (let t of Processes.ProcessClasses) {
            t.Register((<{className: string}>t).className, t);
        }
    }
}
