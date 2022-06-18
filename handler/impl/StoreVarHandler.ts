import { getBestVarStore, isNotValid, storeEnvironment } from "../../Utils";
import { RequestHandler } from "../RequestHandler";
import { VarHandler } from "../VarHandler";

let pluginStore: any = null;

function checkPluginStore(pStore) {
	if(pluginStore == null && pStore != null) {
		pluginStore = pStore;
	}
	return pluginStore;
}

async function isStoreEnabled(pStore) {
	pStore = checkPluginStore(pStore);
	if(pStore == null) {
		return false;
	}
	return await pStore.hasItem('enabled')
	  && await pStore.getItem('enabled') == 'true';
}

async function getOrSetValueOnStore(pStore, env, key, value): Promise<string | null> {
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
		return await pStore.getItem(pluginStoreKey);
	} else {
		await pStore.setItem(pluginStoreKey, value);
        return Promise.resolve(null);
	}
}

export class StoreVarHandler implements VarHandler, RequestHandler {
    beforeRequest(context: any): void {
        storeEnvironment(context.request.getEnvironment());
    }
    async canSave(_: string, __: string): Promise<boolean> {
        return await isStoreEnabled(null);
    }
    async save(name: string, value: string): Promise<void> {
        await getOrSetValueOnStore(null, null, name, value);
        return Promise.resolve();
    }
    async read(context: any, name: string): Promise<string | null> {
        if(!await isStoreEnabled(null)) {
            return Promise.resolve(null);
        }
        return await getOrSetValueOnStore(null, context.context, name, null);
    }
    
}