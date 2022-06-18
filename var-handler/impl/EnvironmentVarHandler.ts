import { storeEnvironment } from "../../Utils";
import { RequestHandler } from "../RequestHandler";
import { VarHandler } from "../VarHandler";

let theEnv: any = null;

export class EnvironmentVarHandler implements VarHandler, RequestHandler {
    canSave(_: string, __: string): Promise<boolean> {
        return Promise.resolve(false);
    }
    save(_: string, __: string): Promise<void> {
        throw new Error("cannot save");
    }
    read(context: any, name: string): Promise<string | null> {
        return Promise.resolve(storeEnvironment(context.context)[name]);
    }
    beforeRequest(context: any): void {
        storeEnvironment(context.request.getEnvironment());
    }
    
}