import { PLogisticsRoles } from "./../processes/logisticsRoles";
import { PTower } from "./../processes/tower";
import { PRepair } from "./../processes/repair";
import { PBuild } from "./../processes/build";
import { PCleanMemory } from "./../processes/cleanMemory";
import { PRoot } from "../processes/root";
import { PBootstrap } from "../processes/bootstrap";
import { PHarvest } from "../processes/harvest";
import { PUpgrade } from "../processes/upgrade";
import { ProcessRegistry } from "./../kernel/processRegistry";
import { Process, ProcessConstructor } from "./../kernel/process";

interface ProcWithStatic {
    className: string;
}

export class Processes {
    public static readonly ProcessClasses = <(ProcessConstructor & { Register(className: string, processCtor: ProcessConstructor): void })[]>[
        PBootstrap,
        PBuild,
        PCleanMemory,
        PHarvest,
        PRepair,
        PRoot,
        PTower,
        PUpgrade,
        PLogisticsRoles,
    ];

    public static RegisterAll(): void {
        //Register each process builder
        const pclasses = Processes.ProcessClasses;
        for (let i = pclasses.length; --i >= 0;) {
            const pclass = pclasses[i];
            pclass.Register(pclass.className, pclass);
        }
    }
}
