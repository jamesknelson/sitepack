var path = require('path')

function createId(relativePath) {
  const basename = path.basename(relativePath)

  const dirname = path.dirname(relativePath).replace(/^[\./]+/, '')
  if (basename == 'SITE.js') {
    return '/'+dirname
  }
  else {
    return '/'+(dirname ? (dirname+'/') : '')+basename
  }
}

module.exports = function sitepackLoader(content) {
  // Not cacheable due to metadata
  // this.cacheable()
  
  const relativePath = path.relative(this.options.sitepack.root, this.resourcePath)
  const eagerByDefault = !!this.options.sitepack.eagerByDefault
  const id = createId(relativePath)
  const stringifiedId = JSON.stringify(id)
  const meta = JSON.stringify(this.inputValue && this.inputValue.meta ? this.inputValue.meta : {})
  const stringifiedChunkName = JSON.stringify(id.substr(1).replace(/\.[a-zA-Z0-9]+$/, '').replace(/[^a-zA-Z0-9]+/g, '-'))
  
  this.clearDependencies()

  const lastPageLoaderIndex =
    this.loaders
      .slice(0)
      .reverse()
      .findIndex(loader => loader.path == __filename)

  const contentRequest = JSON.stringify(
    '!' + this.loaders
      .slice(this.loaders.length - lastPageLoaderIndex)
      .map(loader => loader.request)
      .concat(this.resource)
      .join('!')
  )
  
  if (this.query === '?site') {
    return `module.exports = require('sitepack').wrapSite(${stringifiedId}, ${JSON.stringify(relativePath)}, require(${contentRequest}))`
  }
  else if (this.query === '?eager' || (eagerByDefault && this.query !== '?lazy')) {
    return `module.exports = require('sitepack').wrapEagerContent(${stringifiedId}, ${JSON.stringify(relativePath)}, ${meta}, require(${contentRequest}))`
  }
  else {
    return `
      var contentPromise = function() {
        return new Promise(function (resolve, reject) {
          require.ensure(${contentRequest}, function(require) {
            resolve(require(${contentRequest}))
          }, ${stringifiedChunkName})
        });
      }
      contentPromise.__SITEPACK_PROMISE = true
      module.exports = require('sitepack').wrapLazyContent(${stringifiedId}, ${JSON.stringify(relativePath)}, ${meta}, contentPromise)
    `
  }
}
