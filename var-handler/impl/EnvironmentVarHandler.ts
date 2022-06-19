import { Environment, RenderContext, RequestContext } from "../../insomnia-api/InsomniaAPI";
import { OpenObject, storeEnvironment } from "../../Utils";
import { RequestHandler } from "../RequestHandler";
import { VarHandler } from "../VarHandler";

export class EnvironmentVarHandler implements VarHandler, RequestHandler {
    getAll(): Promise<OpenObject> {
        const env = storeEnvironment(null);
        const ret: OpenObject = {};
        for(const k in env) {
            if(typeof env[k] == 'string') {
                ret[k] = env[k];
            }
        }
        return Promise.resolve(ret);
    }
    canSave(_: string, __: string): Promise<boolean> {
        return Promise.resolve(false);
    }
    save(_: string, __: string): Promise<void> {
        throw new Error("cannot save");
    }
    read(context: RenderContext, name: string): Promise<string | null> {
        return Promise.resolve((storeEnvironment(context.context) as Environment)[name] as string | null);
    }
    beforeRequest(context: RequestContext): void {
        storeEnvironment(context.request.getEnvironment());
    }
    
}