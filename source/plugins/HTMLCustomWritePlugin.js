function HTMLCustomWritePlugin(callback) {
  this.callback = callback;
}

HTMLCustomWritePlugin.prototype.apply = function(compiler) {
  var self = this;

  let assets

  compiler.plugin('compilation', function(compilation) {
    compilation.plugin('html-webpack-plugin-before-html-processing', function (htmlPluginData, callback) {
      assets = htmlPluginData.assets
      callback(null, htmlPluginData);
    });

    compilation.plugin('html-webpack-plugin-after-emit', function (htmlPluginData, callback) {
      delete compilation.assets[htmlPluginData.outputName];
      self.callback(assets, compilation);
      callback(null, htmlPluginData);
    });
  });

};

module.exports = HTMLCustomWritePlugin;
