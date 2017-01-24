import path from 'path'
import webpack from 'webpack'
import HTMLWebpackPlugin from 'html-webpack-plugin'

export default function getWebpackConfig({ isProduction, sitepackConfig, paths, host, port }) {
  // TODO:
  // - instead of randomly including bits from this, we should
  //   clone it and modify the clone to add our settings
  const configBase = sitepackConfig.getWebpackConfig({ isProduction })

  return {
    devtool: 'source-map',

    entry: {
      app: [
        require.resolve('react-dev-utils/webpackHotDevClient'),
        path.join(paths.siteRoot, 'global.less'),
        require.resolve('./polyfills'),
        path.join(__dirname, '../utils/main-web.js'),
      ],
      vendor: [ 'react', 'react-dom' ],
    },

    output: {
      path: paths.siteBuild,
      filename: `bundle-[chunkHash].js`,
      chunkFileName: `[name]-[chunkHash].js`,
      publicPath: '/',
    },

    plugins: [
      new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) }),
      new webpack.optimize.CommonsChunkPlugin('vendor', `vendor-[chunkHash].js`),
      new HTMLWebpackPlugin({
        template: paths.siteHTML,
        page: { title: 'Sitepack' },
        content: '',
      })
    ].concat(isProduction ? [
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.optimize.UglifyJsPlugin()
    ] : []),

    resolve: {
      fallback: paths.nodePaths,
      
      extensions: ['.js', '.json', '.jsx', ''],

      alias: {
        ...configBase.resolve.alias,
        'react': path.resolve(paths.packageRoot, 'node_modules/react'),
        'react-dom': path.resolve(paths.packageRoot, 'node_modules/react-dom'),
        'sitepack': path.resolve(__dirname, '../utils/Sitepack.js'),
        'sitepack-config': paths.siteConfig,
      },
    },

    resolveLoader: {
      root: paths.ownNodeModules,
      modulesDirectories: [
        paths.ownLoaders,
      ]
    },

    module: {
      loaders: [
        { test: /SITE\.js$/,
          loader: 'sitepack?site!babel',
        },
        { test: /\.example\.js$/,
          loader: 'sitepack!module-and-source',
        },
        { test: /\.js$/,
          exclude: /node_modules|\.example\.js|\.SITE\.js$/,
          loader: 'babel'
        },
        { test: /\.css$/,
          loader: 'style!css'
        },
        { test: /\.less$/,
          loader: 'style!css!less'
        },
        { test: /\.md$/,
          loader: 'sitepack?preload!img!markdown'
        },
        { test: /\.(gif|jpe?g|png|ico)$/,
          loader: 'url?limit=4000'
        }
      ]
    },

    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    },

    sitepack: {
      root: paths.packageRoot,
    },
  }
}
