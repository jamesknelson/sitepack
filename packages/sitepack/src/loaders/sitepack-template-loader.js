/*
  Based on the default loader from ampedandwired/html-webpack-plugin,
  but modified to add `content` and `page` variables to the template.
 
  The MIT License (MIT)

  Copyright (c) 2014 Charles Blaxland

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

var _ = require('lodash');
var loaderUtils = require('loader-utils');

module.exports = function (source) {
  if (this.cacheable) {
    this.cacheable();
  }
  var allLoadersButThisOne = this.loaders.filter(function (loader) {
    // Loader API changed from `loader.module` to `loader.normal` in Webpack 2.
    return (loader.module || loader.normal) !== module.exports;
  });
  // This loader shouldn't kick in if there is any other loader
  if (allLoadersButThisOne.length > 0) {
    return source;
  }
  // Skip .js files
  if (/\.js$/.test(this.request)) {
    return source;
  }

  // The following part renders the tempalte with lodash as aminimalistic loader
  //
  // Get templating options
  var options = loaderUtils.getOptions(this);
  // Webpack 2 does not allow with() statements, which lodash templates use to unwrap
  // the parameters passed to the compiled template inside the scope. We therefore
  // need to unwrap them ourselves here. This is essentially what lodash does internally
  // To tell lodash it should not use with we set a variable
  var template = _.template(source, _.defaults(options, { variable: 'data' }));
  return 'var _ = require(' + loaderUtils.stringifyRequest(this, require.resolve('lodash')) + ');' +
    'module.exports = function (templateParams) {' +
      'var content = templateParams.htmlWebpackPlugin.options.content;' +
      'var page = templateParams.htmlWebpackPlugin.options.page;' +
      'var files = templateParams.htmlWebpackPlugin.files;' +
      // Execute the lodash template
      'return (' + template.source + ')();' +
    '}';
};
