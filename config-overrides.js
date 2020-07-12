const path = require('path');

module.exports = {
  // webpack: function(config, env) {
  //   // ...add your webpack config
  //   config.contentBase = path.resolve(__dirname, './assets');
  //   return config;
  // },
  // devServer: function(configFunction) {
  //   // Return the replacement function for create-react-app to use to generate the Webpack
  //   // Development Server config. "configFunction" is the function that would normally have
  //   // been used to generate the Webpack Development server config - you can use it to create
  //   // a starting configuration to then modify instead of having to create a config from scratch.
  //   return function(proxy, allowedHost) {
  //     // Create the default config by calling configFunction with the proxy/allowedHost parameters
  //     const config = configFunction(proxy, allowedHost);
  //     config.contentBase = path.resolve(__dirname, './assets');
  //     config.contentBasePublicPath = path.resolve(__dirname, './assets');
  //
  //     // Return your customised Webpack Development Server config.
  //     return config;
  //   };
  // },
  paths: function (paths) {
    paths.appPublic = path.resolve(__dirname, './src/assets');
    paths.appHtml = path.resolve(__dirname, './src/assets/index.html');
    return paths;
  }
}