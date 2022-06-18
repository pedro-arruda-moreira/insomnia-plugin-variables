import configAction from "./action-handler/ConfigGUI";
import { EnvironmentVarHandler } from "./var-handler/impl/EnvironmentVarHandler";
import { RAMVarHandler } from "./var-handler/impl/RAMVarHandler";
import { StoreVarHandler } from "./var-handler/impl/StoreVarHandler";
import { RequestHandler } from "./var-handler/RequestHandler";
import { VarHandler } from "./var-handler/VarHandler";

const RAMHandler = new RAMVarHandler();
const storeHandler = new StoreVarHandler();
const envHandler = new EnvironmentVarHandler();

const varHandlerList: VarHandler[] = [RAMHandler, storeHandler, envHandler];
const requestHandlerList: RequestHandler[] = [storeHandler, envHandler];


global.setVar = async function(name: string, value: string) {
	for(const handler of varHandlerList) {
        if(await handler.canSave(name, value)) {
            await handler.save(name, value);
        }
    }
}

module.exports.workspaceActions = [
    configAction
];

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
            const notForSend = context.renderPurpose != 'send';
            for(const handler of varHandlerList) {
                const value = await handler.read(context, varName);
                if(value != null) {
                    if(value == '' && notForSend) {
                        return '<empty string>';
                    }
                    return value;
                }
            }
            if(notForSend) {
                return "variable '" + varName + "' not found";
            } else {
				throw new Error("variable '" + varName + "' not found");
            }
		}
	}
];