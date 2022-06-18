import { getBestVarStore } from "../../Utils";
import { VarHandler } from "../VarHandler";

export class RAMVarHandler implements VarHandler {
    read(_: any, name: string): Promise<string | null> {
        return Promise.resolve(getBestVarStore()[name]);
    }
    canSave(_: string, __: string): Promise<boolean> {
        return Promise.resolve(true);
    }
    save(name: string, value: string): Promise<void> {
        getBestVarStore()[name] = value;
        return Promise.resolve();
    }

}