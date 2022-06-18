import { configAction } from "./action-handler/ConfigGUI";
import { RenderContext } from "./insomnia-api/InsomniaAPI";
import { saveVariablesHook } from "./request-handler/RequestHooks";
import { varHandlerList } from "./var-handler/VarHandler";


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


module.exports.requestHooks = [
    saveVariablesHook
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
		async run(context: RenderContext, varName: string) {
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