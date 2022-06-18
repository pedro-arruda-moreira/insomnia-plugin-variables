import { RenderContext } from "../insomnia-api/InsomniaAPI";
import { OpenObject } from "../Utils";
import { EnvironmentVarHandler } from "./impl/EnvironmentVarHandler";
import { RAMVarHandler } from "./impl/RAMVarHandler";
import { StoreVarHandler } from "./impl/StoreVarHandler";

export interface VarHandler {
    canSave(name: string, value: string): Promise<boolean>;
    save(name: string, value: string): Promise<void>;
    read(context: RenderContext, name: string): Promise<string | null>;
    getAll(): Promise<OpenObject>;
}

const RAMHandler = new RAMVarHandler();
export const storeHandler = new StoreVarHandler();
export const envHandler = new EnvironmentVarHandler();


export const varHandlerList: VarHandler[] = [RAMHandler, storeHandler, envHandler];