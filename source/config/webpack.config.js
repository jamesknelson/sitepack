import warning from '../utils/warning'
import path from 'path'
import webpack from 'webpack'
import HTMLWebpackPlugin from 'html-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import HTMLCustomWritePlugin from '../plugins/HTMLCustomWritePlugin.js'


function getResolveConfig(paths) {
  return {
    resolve: {
      modules: ['node_modules'].concat(paths.nodePaths),
      
      extensions: ['.js', '.json', '.jsx'],

      alias: {
        'sitepack': path.resolve(__dirname, '..'),
        'sitepack-virtual-main': paths.main,
        'sitepack-virtual-createSite': paths.createSite,
      },
    },

    resolveLoader: {
      modules: [
        paths.loaders,
        paths.ownLoaders,
        'node_modules',
        paths.ownNodeModules,
      ],
      moduleExtensions: [
        '-loader',
      ],
    },
  }
}


function transformLoaders(environment, packageRoot, loaders, extract) {
  let i = 0
  const transformed = []
  while (i < loaders.length) {
    let loader = loaders[i++]
    if (typeof loader === 'string') {
      loader = { loader: loader }
    }
    else if (!loader || typeof loader !== 'object') {
      throw new Error(`Expected each set of loader options in your sitepack config to be a string or object. Instead received "${loader}".`)
    }
    
    if (loader.loader === 'sitepack-css') {
      if (environment === 'static') {
        return extract.extract({
          fallback: 'style',
          use: ["css"].concat(transformLoaders(environment, packageRoot, loaders.slice(i))),
        })
      }
      else if (environment === 'development') {
        transformed.push('style', { ...loader, loader: 'css'})
      }
      else {
        // The generated CSS needs to take into account CSS files for every
        // possible page. Because of this, our build CSS is generated with the
        // site object -- not with the application.
        return ['null']
      }
    }
    else if (/^sitepack-(.*-)?page$/.test(loader.loader)) {
      transformed.push({
        ...loader,
        options: {
          ...loader.options,
          sitepack: {
            packageRoot,
            environment,
          }
        }
      })
    }
    else {
      transformed.push(loader)
    }
  }
  return transformed
}
function transformRule(environment, packageRoot, rule, extract) {
  if (!rule || typeof rule !== 'object') {
    throw new Error(`Expected each rule in your sitepack config to be an object. Instead received a "${rule}".`)
  }

  const keys = Object.keys(rule)
  const { loader, options, ...other } = rule

  if (rule.oneOf) {
    return { ...other, oneOf: transformRules(environment, packageRoot, rule.oneOf, extract) }
  }

  if (rule.rules) {
    return { ...other, rules: transformRules(environment, packageRoot, rule.rules, extract) }
  }

  if (rule.use) {
    return { ...other, use: transformLoaders(environment, packageRoot, rule.use, extract) }
  }
  else {
    return { ...other, use: transformLoaders(environment, packageRoot, [{ loader, options }], extract) }
  }
}
function transformRules(environment, packageRoot, rules, extract) {
  if (!Array.isArray(rules)) {
    throw new Error(`Expected the "rules" export of your sitepack config to be an Array. Instead received "${rules}".`)
  }

  return rules.map(rule => {
    return transformRule(environment, packageRoot, rule, extract)
  })
}


export function getSiteConfig({ config, paths }) {
  const extract = new ExtractTextPlugin({ filename: 'site-bundle.[contenthash:8].css', allChunks: true })

  return {
    entry: {
      app: [
        require.resolve('./polyfills'),
        require.resolve('../entries/siteEntry'),
      ],
    },

    output: {
      path: '/',
      pathinfo: true,
      publicPath: '/',
      library: 'Junctions',
      libraryTarget: 'commonjs2',
      filename: `site-bundle.js`,
    },

    // Every non-relative module other than "sitepack" that is not prefixed with "sitepack/virtual/" is external
    externals: function(context, request, callback) {
      if (request !== 'sitepack' && !/^sitepack\/virtual\//.test(request) && /^[a-z\-0-9][a-z\-0-9\/]+(\.[a-zA-Z]+)?$/.test(request)) {
        return callback(null, request);
      }
      callback();
    },

    ...getResolveConfig(paths),

    module: {
      rules: transformRules('static', paths.packageRoot, config.rules, extract),
    },

    plugins: [
      extract
    ],
  }
}

export function getAppConfig({ config, environment, paths, writeWithAssets }) {
  const isProduction = environment === 'production'

  return {
    devtool: isProduction ? false : 'source-map',

    entry: {
      entry: 
        (!isProduction
          ? [require.resolve('react-dev-utils/webpackHotDevClient')]
          : [])
        .concat([
          require.resolve('./polyfills'),
          require.resolve('../entries/webEntry'),
        ]),
      vendor: config.vendor || [],
    },

    output: {
      path: paths.output,
      pathinfo: !isProduction,
      filename: `[name]-[chunkHash].js`,
      chunkFilename: `[name]-[chunkHash].js`,
      publicPath: '/',
    },

    ...getResolveConfig(paths),

    module: {
      rules: transformRules(environment, paths.packageRoot, config.rules),
    },

    plugins:
      [
        new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) }),
        new webpack.optimize.CommonsChunkPlugin({
          name: 'vendor', 
          filename: `vendor-[chunkHash].js`
        }),
        new HTMLWebpackPlugin({
          inject: false,
          template: '!!sitepack-template!'+paths.html,
          page: { title: 'sitepack App' },
          content: '',
        }),
      ]
      .concat(isProduction ? [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin(),
      ] : [])
      .concat(writeWithAssets
        // Prevent HTMLWebpackPlugin from writing any HTML files to disk,
        // as we'd like to handle that ourself
        ? [new HTMLCustomWritePlugin(writeWithAssets)]
        : []
      ),

    node: {
      fs: "empty",
      module: "empty",
      net: "empty",
    },
  }
}
