import path from 'path'
import { stringifyRequest } from 'loader-utils'


module.exports = function sitepackLoader(content) {
  this.clearDependencies()

  const id = '/'+path.relative(this.sitepack.packageRoot, this.resourcePath)
  const stringifiedId = JSON.stringify(id)

  // Find the request that would be required to get everything *after*
  // `sitepack-page` -- including the JavaScript file for the page and any
  // loaders used to compile it.
  const contentRequest = stringifyRequest(this,
    '!!' + this.loaders
      .slice(this.loaderIndex + 1)
      .map(loader => loader.request)
      .concat(this.resource)
      .join('!')
  )
  
  return `module.exports = require('sitepack').createPage(${stringifiedId}, require(${contentRequest}))`
}
