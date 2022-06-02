function getVarStore(insomnia) {
	let store = insomnia.varStore;
	if(isNotValid(typeof store)) {
		console.log('creating new var store.');
		store = {};
		insomnia.varStore = store;
	}
	return store;
}

function isNotValid(objType) {
	return objType == 'undefined' || objType == 'null';
}

async function getFromEnvVar(context, varName, requestContext) {
	let theEnv = context.context;
	if(requestContext) {
		theEnv = context.request.getEnvironment();
	}
	let envId = theEnv.getEnvironmentId();
	let envVar = null;
	let storeName = envId + '_' + varName;
	let isEnabled = await context.store.hasItem('enabled') && await context.store.getItem('enabled') == 'true';
	if(isEnabled && (await context.store.hasItem(storeName))) {
		return await context.store.getItem(storeName);
	} else {
		envVar = theEnv[varName];
		if(isNotValid(typeof envVar) && !requestContext) {
			if(context.renderPurpose != 'send') {
				return "<variable '" + varName + "' not found>";
			} else {
				throw new Error("variable '" + varName + "' not found");
			}
		}
		return envVar;
	}
}

async function createConfigGUI(context) {
	function createElem(elemType) {
		return global.document.createElement(elemType);
	}
	let label = createElem('label');
	label.id = 'lblVarPluginSaveVars';
	label.setAttribute('for', 'checkboxVarPluginSaveVars');
	label.innerHTML = 'Persist changes in variables&nbsp;';
	let chk = createElem('input');
	chk.id = 'checkboxVarPluginSaveVars';
	chk.type = 'checkbox';
	let isChecked = await context.store.hasItem('enabled') && await context.store.getItem('enabled') == 'true';
	if(isChecked) {
		chk.setAttribute('checked', 'checked');
	}
	chk.addEventListener('change', async function(e) {
		isChecked = !isChecked;
		await context.store.setItem('enabled', '' + isChecked);
	});
	let div = createElem('div');
	div.appendChild(label);
	div.appendChild(chk);
	return div;
}

async function doGetVar(context, varName, onlyFromMemory) {
	if(isNotValid(typeof insomnia)) {
		if(onlyFromMemory) {
			return null;
		}
		return await getFromEnvVar(context, varName, false);
	}
	let store = getVarStore(insomnia);
	if(isNotValid(typeof store[varName])) {
		if(onlyFromMemory) {
			return null;
		}
		return await getFromEnvVar(context, varName, false);
	}
	return store[varName];
}


global.setVar = function(insomnia, name, value) {
	getVarStore(insomnia)[name] = value;
}

module.exports.templateTags = [
	{
		displayName: 'Variable',
		name: 'variable',
		description: 'Gets a variable',
		args: [
			{
				displayName: 'name',
				type: 'string',
			},
		],
		async run(context, varName) {
			return await doGetVar(context, varName, false);
		}
	}
];

module.exports.workspaceActions = [{
  label: 'insomnia-plugin-variables options',
  icon: 'fa-wrench',
  action: async (context, models) => {
    context.app.dialog(
		'insomnia-plugin-variables options',
		await createConfigGUI(context),
		{
			tall: false,
			wide: false,
			skinny: true
		}
	);
  },
}];

module.exports.requestHooks = [
	async function(context) {
		let isEnabled = await context.store.hasItem('enabled') && await context.store.getItem('enabled') == 'true';
		if(!isEnabled) {
			return;
		}
		let allEnvVarNames = [];
		let theEnv = context.request.getEnvironment();
		let i = null;
		for(i in theEnv) {
			if(typeof theEnv[i] != 'function') {
				allEnvVarNames.push(i);
			}
		}
		for(i of allEnvVarNames) {
			let memoryValue = await doGetVar(context, i, true);
			if(memoryValue == null) {
				continue;
			}
			let storedValue = await getFromEnvVar(context, i, true);
			if(memoryValue != storedValue) {
				let envId = theEnv.getEnvironmentId();
				await context.store.setItem(envId + '_' + i, memoryValue);
			}
		}
	}
];