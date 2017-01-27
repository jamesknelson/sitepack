const Prism = require('prismjs')

module.exports = function sourcedLoader(content) {
  this.cacheable()
  
  const moduleRequest = '!!babel!'+this.resourcePath
  const sourceRequest = '!!prismjs?lang=jsx!'+this.resourcePath

  this.value = {
    meta: {},
  }

  return `
    module.exports = {
      module: require(${JSON.stringify(moduleRequest)}),
      source: require(${JSON.stringify(sourceRequest)}),
    }
  `
}
