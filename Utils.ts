
const ENVIRONMENT_KEY = '__environment__';
let LAST_INSO_OBJ = null;

function getVarStore(targetObj: any, reset: boolean) {
	let varStore = targetObj.varStore;
	if(isNotValid(varStore) || reset) {
		console.log('creating new var store.');
		varStore = {};
		targetObj.varStore = varStore;
	}
	return varStore;
}

export function isValid(value: any) {
    const tp = typeof(value) as string;
    return tp != 'null' && tp != 'undefined';
}

export function isNotValid(value: any) {
    return !isValid(value);
}

export function storeEnvironment(env) {
    const varStore = getBestVarStore();
    if(isNotValid(env)) {
        env = varStore[ENVIRONMENT_KEY];
    } else {
        varStore[ENVIRONMENT_KEY] = env;
    }
    return env;
}

export function getBestVarStore() {
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