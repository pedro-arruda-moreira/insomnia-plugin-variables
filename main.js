let pluginStore = null;

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

async function getOrSetValueOnStore(pStore, envName, key, value) {
	pStore = checkPluginStore(pStore);
	if(pStore == null) {
		throw new Error('plugin store not found.');
	}
	if(!isNotValid(typeof insomnia)) {
		let varStore = getVarStore(insomnia);
		if(envName != null) {
			if(isNotValid(typeof varStore['__environment__'])) {
				varStore['__environment__'] = envName;
			}
		} else {
			envName = varStore['__environment__'];
		}
	} else if(envName == null) {
		throw new Error('unknown environment ID.');
	}
	if(isNotValid(typeof envName)) {
		console.log('could not store var: env unknown.');
		return null;
	}
	let pluginStoreKey = envName + '_' + key;
	if(value == null) {
		return await pStore.getItem(pluginStoreKey);
	} else {
		await pStore.setItem(pluginStoreKey, value);
	}
}

function getVarStore(/*insomnia*/) {
	let varStore = insomnia.varStore;
	if(isNotValid(typeof varStore)) {
		console.log('creating new var store.');
		varStore = {};
		insomnia.varStore = varStore;
	}
	return varStore;
}

function isNotValid(objType) {
	return objType == 'undefined' || objType == 'null';
}

async function getFromEnvVar(context, varName, isRequestContext) {
	let theEnv = context.context;
	if(isRequestContext) {
		theEnv = context.request.getEnvironment();
	}
	let envId = theEnv.getEnvironmentId();
	let envVar = null;
	let isEnabled = await isStoreEnabled(context.store);
	if(isEnabled) {
		let value = await getOrSetValueOnStore(context.store, envId, varName, null);
		if(!!value) {
			return value;
		}
	}
	envVar = theEnv[varName];
	if(!isRequestContext) {
		let notForSend = context.renderPurpose != 'send';
		if(isNotValid(typeof envVar)) {
			if(notForSend) {
				return "<variable '" + varName + "' not found>";
			} else {
				throw new Error("variable '" + varName + "' not found");
			}
		} else if(notForSend && envVar == '') {
			return '<empty string>';
		}
	}
	return envVar;
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
	let isChecked = await isStoreEnabled(context.store);
	if(isChecked) {
		chk.setAttribute('checked', 'checked');
	}
	chk.addEventListener('change', async function(ev) {
		isChecked = !isChecked;
		await checkPluginStore(context.store).setItem('enabled', '' + isChecked);
	});
	let clearBtn = createElem('a');
	clearBtn.href = 'javascript://';
	clearBtn.addEventListener('click', async function(ev) {
		if(global.confirm('Are you sure? This cannot be undone!')) {
			await checkPluginStore(context.store).clear();
			if(isChecked) {
				await checkPluginStore(context.store).setItem('enabled', '' + isChecked);
			}
		}
	});
	clearBtn.innerHTML = 'Clear persisted variables values';
	let div = createElem('div');
	div.appendChild(label);
	div.appendChild(chk);
	div.appendChild(createElem('br'));
	div.appendChild(createElem('br'));
	div.appendChild(clearBtn);
	return div;
}

async function doGetVar(context, varName, isRequestContext) {
	if(isNotValid(typeof insomnia)) {
		if(context == null) {
			return null;
		}
		return await getFromEnvVar(context, varName, isRequestContext);
	}
	let varStore = getVarStore(/*insomnia*/);
	if(isNotValid(typeof varStore[varName])) {
		if(context == null) {
			return null;
		}
		return await getFromEnvVar(context, varName, isRequestContext);
	}
	return varStore[varName];
}


global.setVar = async function(/*insomnia, */name, value) {
	getVarStore(/*insomnia*/)[name] = value;
	if(await isStoreEnabled(null)) {
		await getOrSetValueOnStore(null, null, name, value);
	}
}

module.exports.templateTags = [
	{
		liveDisplayName: function(args) {
			return "Variable => " + args[0].value;
		},
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
		let isEnabled = await isStoreEnabled(context.store);
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
			let memoryValue = await doGetVar(null, i, true);
			if(memoryValue == null) {
				continue;
			}
			let storedValue = await getFromEnvVar(context, i, true);
			if(memoryValue != storedValue) {
				let envId = theEnv.getEnvironmentId();
				await getOrSetValueOnStore(context.store, envId, i, memoryValue);
			}
		}
	}
];