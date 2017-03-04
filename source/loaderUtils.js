import path from 'path'
import { getOptions, stringifyRequest } from 'loader-utils'
import warning from './utils/warning'
import getChunkNameForId from './utils/getChunkNameForId'


export function loadPageWithContent(loader, options, moduleContentsAsString) {
  const loaderOptions = getOptions(loader)

  if (loaderOptions.lazy && loaderOptions.eager) {
    warning('Both lazy and eager were passed to a page loader! Defaulting to eager.')
  }

  if (loaderOptions.raw) {
    return moduleContentsAsString
  }
  else {
    loader.clearDependencies()

    const id = '/'+path.relative(loaderOptions.sitepack.packageRoot, loader.resourcePath)
    const eagerByDefault = loaderOptions.sitepack.environment === 'static'
    const stringifiedId = JSON.stringify(id)
    const stringifiedOptions = JSON.stringify(options)
    
    if (loaderOptions.eager || (eagerByDefault && !loaderOptions.lazy)) {
      return moduleContentsAsString + ';\n' +
        `module.exports = require('sitepack').createPage(${stringifiedId}, ${stringifiedOptions}, module.exports)`
    }
    else {
      const nextLoaderOptions = JSON.stringify(Object.assign({}, loaderOptions, { raw: true }))

      // Find the request that would be required to get everything *after*
      // this loader -- including the JavaScript file for the page and any
      // loaders used to compile it.
      const contentRequest = stringifyRequest(loader,
        '!!' +
        loader.loaders[loader.loaderIndex].path + '?'+nextLoaderOptions+'!' +
        loader.loaders
          .slice(loader.loaderIndex + 1)
          .map(loader => loader.request)
          .concat(loader.resource)
          .join('!')
      )

      const stringifiedChunkName = JSON.stringify(getChunkNameForId(id))

      return `
        var sitepack = require('sitepack')
        var contentGetter = sitepack.createContentGetter(function() {
          return new Promise(function (resolve, reject) {
            require.ensure(${contentRequest}, function(require) {
              resolve(require(${contentRequest}))
            }, ${stringifiedChunkName})
          });
        })
        module.exports = sitepack.createPage(${stringifiedId}, ${stringifiedOptions}, contentGetter)
      `
    }
  }
}
