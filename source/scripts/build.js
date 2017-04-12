global.regeneratorRuntime = require('regenerator-runtime/runtime')

import _ from 'lodash'
import chalk from 'chalk'
import webpack from 'webpack'
import path from 'path'
import createMemoryHistory from 'history/createMemoryHistory'
import requireFromString from 'require-from-string'
import fs from 'fs-extra'
import MemoryFS from 'memory-fs'
import { getAppConfig, getSiteConfig } from '../config/webpack.config'
import getPaths from '../config/paths'
import getChunkNameForId from '../utils/getChunkNameForId'
import getContentIdForPage from '../utils/getContentIdForPage'


export default function build({ output, siteRoot, packageRoot, config }) {
  const paths = getPaths(packageRoot, siteRoot, config.paths, output);
  const renderToStringModule = require(paths.renderToString);
  const renderToString = typeof renderToStringModule == 'function' ? renderToStringModule : renderToStringModule.default

  if (typeof renderToString !== 'function') {
    throw new Error(`Your "renderToString" file at ${paths.renderToString} did not export a default function.`)
  }

  const webpackConfig = getSiteConfig({ config, paths })

  const compiler = webpack(webpackConfig);
  const memoryFS = new MemoryFS()

  console.log('Generating site data...')

  compiler.outputFileSystem = memoryFS;
  compiler.run((err, stats) => {
    if (err) {
      return console.log(err);
    }

    console.log('Loading site data...')

    const fileContent = memoryFS.readFileSync("/site-bundle.js").toString('utf8');
    requireFromString('var window = {}; '+fileContent, path.join(packageRoot, 'site-bundle.js')).default.then(site => {

      let cssFile;
      const files = memoryFS.readdirSync("/")
      const bundlePattern = /^site-bundle\.([a-z0-9]{8})\.css$/
      for (let i = 0, len = files.length; i < len; i++) {
        const name = files[i]
        const matches = name.match(bundlePattern)
        if (name === 'site-bundle.js') {
          continue
        }
        
        if (matches) {
          cssFile = name;
        }

        console.log(`Creating "${name}"...`)
        const pathname = path.join(paths.output, name)
        fs.ensureDirSync(path.dirname(pathname))
        fs.writeFileSync(pathname, memoryFS.readFileSync('/'+name))
      }

      console.log('Copying public files...')
      copyPublicFolder(paths);

      console.log('Generating app scripts...')
      const webpackConfig = getAppConfig({
        environment: 'production',
        config,
        paths,
        writeWithAssets: (assets, compilation) => {
          const pageIds = Object.keys(site.pages)
          for (let i = 0, len = pageIds.length; i < len; i++) {
            const id = pageIds[i]
            const page = site.pages[id]

            if (page.absolutePath) {
              let name = page.absolutePath.substr(1)
              if (page.children) name = path.join(name, 'index')
              name += '.html'
              console.log(`Creating "${name}"...`)
              let content
              try {
                const history = createMemoryHistory({
                  initialEntries: [ page.absolutePath ],
                })

                content = renderToString({ site, history })
              }
              catch (err) {
                console.error(chalk.red("Could not render HTML"))
                console.error(err)
                process.exit(1)
              }

              const js = assets.js.slice(0)
              const contentId = getContentIdForPage(page)
              const chunkName = getChunkNameForId(contentId)
              const chunk = compilation.namedChunks[chunkName]
              if (chunk) {
                js.splice(1, 0, '/'+chunk.files[0])
              }

              const template = _.template(fs.readFileSync(paths.html));
              const html = template({
                page: page,
                content: content,
                files: {
                  ...assets,
                  js: js,
                  css: assets.css.concat(['/'+cssFile]),
                }
              })

              const pathname = path.join(paths.output, name)
              fs.ensureDirSync(path.dirname(pathname))
              fs.writeFileSync(pathname, html)
            }
          }
        }
      })
      const compiler = webpack(webpackConfig);

      compiler.run((err, stats) => {
        if (err) {
          return console.log(err);
        }
      })
    })
  })
}


function copyPublicFolder(paths) {
  fs.copySync(paths.public, paths.output, {
    dereference: true,
    filter: file => file !== paths.html
  });
}
