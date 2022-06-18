import { PluginStore, RenderContext, RequestContext } from "../../insomnia-api/InsomniaAPI";
import { getBestVarStore, isNotValid, OpenObject, storeEnvironment } from "../../Utils";
import { RequestHandler } from "../RequestHandler";
import { VarHandler } from "../VarHandler";

let pluginStore: PluginStore | null = null;

export function checkPluginStore(pStore: PluginStore | null): PluginStore | null {
	if(pluginStore == null && pStore != null) {
		pluginStore = pStore;
	}
	return pluginStore;
}

export async function isStoreEnabled(pStore: PluginStore | null) {
	pStore = checkPluginStore(pStore);
	if(pStore == null) {
		return false;
	}
	return await pStore.hasItem('enabled')
	  && await pStore.getItem('enabled') == 'true';
}

async function getOrSetValueOnStore(pStore: PluginStore | null, env, key, value): Promise<string | null> {
	pStore = checkPluginStore(pStore);
	if(isNotValid(pStore)) {
		throw new Error('plugin store not found.');
	}
    if(isNotValid(env)) {
        env = storeEnvironment(null);
    }
	if(isNotValid(env)) {
		throw new Error('unknown environment.');
	}
	let pluginStoreKey = env.getEnvironmentId() + '_' + key;
	if(value == null) {
		return await (pStore as PluginStore).getItem(pluginStoreKey);
	} else {
		await (pStore as PluginStore).setItem(pluginStoreKey, value);
        return Promise.resolve(null);
	}
}

export class StoreVarHandler implements VarHandler, RequestHandler {
	async getAll(): Promise<OpenObject> {
		if(!await isStoreEnabled(null)) {
			return Promise.resolve({});
		}
		const allValues = await checkPluginStore(null)!.all();
		const ret = {};
		for(const v of allValues) {
			ret[v.key] = v.value;
		}
		return ret;
	}
    beforeRequest(context: RequestContext): void {
        storeEnvironment(context.request.getEnvironment());
    }
    async canSave(_: string, __: string): Promise<boolean> {
        return await isStoreEnabled(null);
    }
    async save(name: string, value: string): Promise<void> {
        await getOrSetValueOnStore(null, null, name, value);1
        return Promise.resolve();
    }
    async read(context: RenderContext, name: string): Promise<string | null> {
        if(!await isStoreEnabled(context.store)) {
            return Promise.resolve(null);
        }
        return await getOrSetValueOnStore(context.store, context.context, name, null);
    }
    
}