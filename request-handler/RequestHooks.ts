import { RequestContext, RequestHook } from "../insomnia-api/InsomniaAPI";
import { RequestHandler } from "../var-handler/RequestHandler";
import { envHandler, storeHandler, varHandlerList } from "../var-handler/VarHandler";

const requestHandlerList: RequestHandler[] = [storeHandler, envHandler];

export const saveVariablesHook: RequestHook = async (context: RequestContext) => {
    for(const currentHandler of requestHandlerList) {
        currentHandler.beforeRequest(context);
    }
    let i = 0;
    for(; i < varHandlerList.length - 1; i++) {
        const allValues = await varHandlerList[i].getAll();
        for(const k in allValues) {
            if(await varHandlerList[i + 1].canSave(k, allValues[k] as string)) {
                await varHandlerList[i + 1].save(k, allValues[k] as string);
            }
        }
    }
};