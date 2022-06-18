import { Environment } from "./insomnia-api/InsomniaAPI";

const ENVIRONMENT_KEY = '__environment__';
let LAST_INSO_OBJ = null;

function getVarStore(targetObj: any, reset: boolean): OpenObject {
	let varStore = targetObj.varStore as OpenObject | null;
	if(isNotValid(varStore) || reset) {
		console.log('creating new var store.');
		varStore = {};
		targetObj.varStore = varStore;
	}
	return varStore as OpenObject;
}

export function isValid(value: any) {
    const tp = typeof(value) as string;
    return tp != 'null' && tp != 'undefined';
}

export function isNotValid(value: any) {
    return !isValid(value);
}

export function storeEnvironment(env: Environment | null) {
    const varStore = getBestVarStore();
    if(isNotValid(env)) {
        env = varStore[ENVIRONMENT_KEY] as Environment;
    } else {
        varStore[ENVIRONMENT_KEY] = env;
    }
    return env;
}

export function getBestVarStore(): OpenObject {
    let newInsoObj = null;
    let targetToStore = global;
    if(isValid(global.insomnia)) {
        targetToStore = global.insomnia;
        newInsoObj = global.insomnia;
    }
    if(newInsoObj != LAST_INSO_OBJ) {
        if(LAST_INSO_OBJ != null) {
            getVarStore(LAST_INSO_OBJ, true);
        }
        LAST_INSO_OBJ = newInsoObj;
    }
    return getVarStore(targetToStore, false);
}

export interface OpenObject {
    [x: string]: unknown;
}