function HTMLCustomWritePlugin(callback) {
  this.callback = callback;
}

HTMLCustomWritePlugin.prototype.apply = function(compiler) {
  var self = this;

  compiler.plugin('compilation', function(compilation) {
    compilation.plugin('html-webpack-plugin-before-html-processing', function (htmlPluginData, callback) {
      self.callback(htmlPluginData.assets);
      callback(null, htmlPluginData);
    });

    compilation.plugin('html-webpack-plugin-after-emit', function (htmlPluginData, callback) {
      delete compilation.assets[htmlPluginData.outputName];
      callback(null, htmlPluginData);
    });
  });

};

module.exports = HTMLCustomWritePlugin;
