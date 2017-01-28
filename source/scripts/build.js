import _ from 'lodash'
import chalk from 'chalk'
import webpack from 'webpack'
import path from 'path'
import createMemoryHistory from 'history/createMemoryHistory'
import ReactDOMServer from 'react-dom/server'
import React from 'react'
import requireFromString from 'require-from-string'
import fs from 'fs-extra'
import MemoryFS from 'memory-fs'
import swPrecache from 'sw-precache'
import { getAppConfig, getSiteConfig } from '../config/webpack.config'
import getPaths from '../config/paths'



export default function build({ output, siteRoot, packageRoot, sitepackConfig }) {
  const paths = getPaths(packageRoot, siteRoot, output);

  const config = getSiteConfig({
    isProduction: true,
    sitepackConfig,
    paths,
  })

  const compiler = webpack(config);
  const memoryFS = new MemoryFS()

  console.log('Generating site data...')

  compiler.outputFileSystem = memoryFS;
  compiler.run((err, stats) => {
    if (err) {
      return console.log(err);
    }

    console.log('Loading site data...')

    const fileContent = memoryFS.readFileSync("/site-bundle.js").toString('utf8');
    const site = requireFromString('var window = {}; '+fileContent, path.join(packageRoot, 'site-bundle.js')).default;

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
      const pathname = path.join(paths.siteBuild, name)
      fs.ensureDirSync(path.dirname(pathname))
      fs.writeFileSync(pathname, memoryFS.readFileSync('/'+name))
    }

    console.log('Copying public files...')
    copyPublicFolder(paths);

    console.log('Generating app scripts...')
    const config = getAppConfig({
      isProduction: true,
      sitepackConfig,
      paths,
      writeWithAssets: (assets, compilation) => {
        const pageIds = Object.keys(site.pages)
        for (let i = 0, len = pageIds.length; i < len; i++) {
          const id = pageIds[i]
          const page = site.pages[id]

          let name = page.absolutePath.substr(1)
          if (page.index) name = path.join(name, 'index')
          name += '.html'
          console.log(`Creating "${name}"...`)
          let content
          try {
            content = renderToString(sitepackConfig, site, page.absolutePath)
          }
          catch (err) {
            console.error(chalk.red("Could not render HTML"))
            console.error(err)
            process.exit(1)
          }

          const js = assets.js.slice(0)
          if (page.contentId) {
            const chunkName = page.contentId.substr(1).replace(/\.[a-zA-Z0-9]+$/, '').replace(/[^a-zA-Z0-9]+/g, '-')
            const chunk = compilation.namedChunks[chunkName]
            if (chunk) {
              js.splice(1, 0, '/'+chunk.files[0])
            }
          }

          const template = _.template(fs.readFileSync(paths.siteHTML));
          const html = template({
            page: page,
            content: content,
            files: {
              ...assets,
              js: js,
              css: assets.css.concat(['/'+cssFile]),
            }
          })

          const pathname = path.join(paths.siteBuild, name)
          fs.ensureDirSync(path.dirname(pathname))
          fs.writeFileSync(pathname, html)
        }
      }
    })
    const compiler = webpack(config);

    compiler.run((err, stats) => {
      if (err) {
        return console.log(err);
      }

      swPrecache.write(`${paths.siteBuild}/service-worker.js`, {
        staticFileGlobs: [paths.siteBuild + '/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}'],
        stripPrefix: paths.siteBuild
      });
    })
  })
}


function renderToString(sitepackConfig, site, path) {
  const Application = sitepackConfig.getApplicationComponent()

  const history = createMemoryHistory({
    initialEntries: [ path ],
  })

  return ReactDOMServer.renderToString(
    React.createElement(Application, {
      history: history,
      site: site,
    })
  )
}


function copyPublicFolder(paths) {
  fs.copySync(paths.sitePublic, paths.siteBuild, {
    dereference: true,
    filter: file => file !== paths.siteHTML
  });
}
