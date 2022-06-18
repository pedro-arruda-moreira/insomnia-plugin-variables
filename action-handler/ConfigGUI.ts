import { PluginStore, WorkspaceAction, WorkspaceActionContext } from "../insomnia-api/InsomniaAPI";
import { checkPluginStore, isStoreEnabled } from "../var-handler/impl/StoreVarHandler";

async function createConfigGUI(context: WorkspaceActionContext) {
	function createElem(elemType: string) {
		return global.document.createElement(elemType);
	}
	let label = createElem('label');
	label.id = 'lblVarPluginSaveVars';
	label.setAttribute('for', 'checkboxVarPluginSaveVars');
	label.innerHTML = 'Persist changes in variables&nbsp;';
	let chk = createElem('input') as HTMLInputElement;
	chk.id = 'checkboxVarPluginSaveVars';
	chk.type = 'checkbox';
	let isChecked = await isStoreEnabled(context.store);
	if(isChecked) {
		chk.setAttribute('checked', 'checked');
	}
	chk.addEventListener('change', async function(ev) {
		isChecked = !isChecked;
		await (checkPluginStore(context.store) as PluginStore).setItem('enabled', '' + isChecked);
	});
	let clearBtn = createElem('a') as HTMLAnchorElement;
	clearBtn.href = 'javascript://';
	clearBtn.addEventListener('click', async function(ev) {
		if(global.confirm('Are you sure? This cannot be undone!')) {
			await (checkPluginStore(context.store) as PluginStore).clear();
			if(isChecked) {
				await (checkPluginStore(context.store) as PluginStore).setItem('enabled', '' + isChecked);
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

const configAction: WorkspaceAction = {
    label: 'insomnia-plugin-variables options',
    icon: 'fa-wrench',
    action: async(context: WorkspaceActionContext, data: any) => {
        context.app.dialog(
            'insomnia-plugin-variables options',
            await createConfigGUI(context),
            {
                tall: false,
                wide: false,
                skinny: true
            }
        );
      
    }
}

export default configAction;