# babel-plugin-lug

A Babel plugin to instrument `console.log`, statements, and branches for logging and coverage analysis.

## Quick Start
### Before we start, please execute the following script to start the server 
```sh
  npm install
  npm link
  cd ./please-open-here
  npm install
  npm link babel-plugin-lug
  npx babel ./please-do-not-open/utils.js --out-file ./dist/please-do-not-open/utils.js
  npx babel server.js --out-file ./dist/server.compiled.js
  node ./server.js  
```  
### In another terminal:
```sh
  cd ./please-open-here
  node ./example.js
```
### later

## Installation (Local Development)

Since `babel-plugin-lug` is not published yet, you need to use it locally by linking it.

### Linking Locally
If you are working on `babel-plugin-lug` and want to use it in another local project, follow these steps:

1. **Navigate to the plugin directory:**
   ```sh
   cd /path/to/babel-plugin-lug
   ```
2. **Create a global symlink:**
   ```sh
   npm link
   ```
3. **Use the plugin in another project:**
   ```sh
   cd /path/to/your-project
   npm link babel-plugin-lug
   ```

This will link your local version of `babel-plugin-lug` to your project without publishing it.

### Unlinking
To remove the symlink when no longer needed:

- In the project directory:
  ```sh
  npm unlink babel-plugin-lug
  ```
- In the plugin directory:
  ```sh
  npm unlink
  ```

## Usage

To use this plugin, add it to your Babel configuration.

### `.babelrc`

```json
{
  "plugins": ["babel-plugin-lug"]
}
```

### `babel.config.js`

```js
module.exports = {
  plugins: ["babel-plugin-lug"]
};
```

## Dependencies

This plugin requires the following Babel packages:

```json
"devDependencies": {
  "@babel/core": "^7.26.8",
  "@babel/generator": "^7.26.8",
  "babel-cli": "^6.26.0"
}
```

Ensure you have Babel installed before using this plugin.

## License

This project is licensed under the MIT License.

## Author

