import { Process, ProcessConstructor } from "./../kernel/process";
import { ProcessRegistry } from "./../kernel/processRegistry";
import * as ProcessTypes from "../processes"; 

export class Processes {
    public static RegisterAll(): void {
        //Register each process constructor
        const pclasses = Object.values(<{ [processModule: string]: ProcessConstructor }><any>ProcessTypes);
        for (let i = pclasses.length; --i >= 0;) {
            const pclass = pclasses[i];
            pclass.Register();
        }
    }
}
