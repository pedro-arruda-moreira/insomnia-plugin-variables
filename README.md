# insomnia-plugin-variables
A (subjectively) better way to chain requests in insomnia/inso CLI

## How to get it?
- Use NPM:
```sh
$ # inside insomnia plugins folder
$ npm install insomnia-plugin-variables
```
- Or using the plugin configuration screen inside insomnia:
![Plugin configuration screen screenshot](/docs/img/insomnia_plugin_cfg.png "Plugin configuration screen screenshot")


## How to use it?

- When testing, it's possible to define variables programmatically:
```js
await global.setVar('my-var', 'value');
const response1 = await insomnia.send();
await global.setVar('my-var2', 'other value');
```
- Then just use the tag for putting the value on a header or on the body:
![Tag config screenshot](/docs/img/tag.png "Tag config screenshot")


### Persisting values
- Values can be persisted, to enable it, open the plugin configuration from the document menu:
![Document menu](/docs/img/menu-cfg.png "Document menu")
- And then enable it:
![Configuration](/docs/img/persist.png "Configuration")
