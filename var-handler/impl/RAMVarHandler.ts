import { RenderContext } from "../../insomnia-api/InsomniaAPI";
import { getBestVarStore, OpenObject } from "../../Utils";
import { VarHandler } from "../VarHandler";

export class RAMVarHandler implements VarHandler {
    getAll(): Promise<OpenObject> {
        return Promise.resolve(getBestVarStore());
    }
    read(_: RenderContext, name: string): Promise<string | null> {
        return Promise.resolve(getBestVarStore()[name] as string | null);
    }
    canSave(_: string, __: string): Promise<boolean> {
        return Promise.resolve(true);
    }
    save(name: string, value: string): Promise<void> {
        getBestVarStore()[name] = value;
        return Promise.resolve();
    }

}