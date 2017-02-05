import path from 'path'
import webpack from 'webpack'
import HTMLWebpackPlugin from 'html-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import HTMLCustomWritePlugin from '../plugins/HTMLCustomWritePlugin.js'


function getResolveConfig(paths) {
  return {
    resolve: {
      fallback: paths.nodePaths,
      
      extensions: ['.js', '.json', '.jsx', ''],

      alias: {
        'react': path.resolve(paths.packageRoot, 'node_modules/react'),
        'react-dom': path.resolve(paths.packageRoot, 'node_modules/react-dom'),
        'sitepack': path.resolve(__dirname, '../index.js'),
        'sitepack-config': paths.siteConfig,
      },
    },

    resolveLoader: {
      root: paths.ownNodeModules,
      moduleTemplates: [
        '*-loader'
      ],
      modulesDirectories: [
        paths.ownLoaders,
        'node_modules',
      ],
    },
  }
}

function getLoaders({ getStyleLoader }) {
  return [
    // TODO: These should be defaults, somehow
    { test: /SITE\.js$/,
      loader: 'sitepack?site!babel',
    },
    { test: /\.js$/,
      exclude: /node_modules|\.example\.js|\.SITE\.js$/,
      loader: 'babel'
    },
    { test: /\.css$/,
      loader: getStyleLoader('css'),
    },

    // TODO: These should be configurable by adding to the defaults
    //       - instead of sitepack!module-and-source, there should be a sitepack-source loader package
    //       - instead of sitepack!markdown, there should be a sitepack-markdown loader package
    { test: /\.(gif|jpe?g|png|ico)$/,
      loader: 'url?limit=4000'
    },
    { test: /\.example\.js$/,
      loader: 'sitepack!module-and-source',
    },
    { test: /\.mdx?$/,
      loader: 'sitepack!markdown?es5'
    },
    { test: /\.less$/,
      loader: getStyleLoader('css!less'),
    },
  ]
}


export function getSiteConfig({ sitepackConfig, paths }) {
  return {
    entry: {
      app: [
        // Render the 
        path.join(paths.siteRoot, 'global.less'),
        require.resolve('./polyfills'),
        require.resolve('../siteEntry'),
      ],
    },

    output: {
      path: '/',
      publicPath: '/',
      library: 'Junctions',
      libraryTarget: 'commonjs2',
      filename: `site-bundle.js`,
    },

    // Every non-relative module not prefixed with "sitepack-" is external
    externals: function(context, request, callback) {
        // Every module prefixed with "global-" becomes external
        // "global-abc" -> abc
        if(!/^sitepack/.test(request) && /^[a-z\-0-9][a-z\-0-9\/]+(\.[a-zA-Z]+)?$/.test(request)) {
          return callback(null, request);
        }
        callback();
    },

    ...getResolveConfig(paths),

    module: {
      loaders: getLoaders({
        getStyleLoader: str => ExtractTextPlugin.extract('style', str),
      })
    },

    plugins: [
      new ExtractTextPlugin('site-bundle.[contenthash:8].css'),
    ],

    sitepack: {
      root: paths.packageRoot,
      eagerByDefault: true,
    },
  }
}

export function getAppConfig({ isProduction, sitepackConfig, paths, writeWithAssets }) {
  return {
    devtool: isProduction ? false : 'source-map',

    entry: {
      entry: 
        (!isProduction
          ? [require.resolve('react-dev-utils/webpackHotDevClient')]
          : [])
        .concat([
          path.join(paths.siteRoot, 'global.less'),
          require.resolve('./polyfills'),
          require.resolve('../webEntry'),
        ]),
      vendor: [ 'react', 'react-dom' ],
    },

    output: {
      path: paths.siteBuild,
      filename: `[name]-[chunkHash].js`,
      chunkFileName: `[name]-[chunkHash].js`,
      publicPath: '/',
    },

    ...getResolveConfig(paths),

    module: {
      loaders: getLoaders({
        getStyleLoader: (str) => isProduction ? 'null' : 'style!'+str
      })
    },

    plugins:
      [
        new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) }),
        new webpack.optimize.CommonsChunkPlugin('vendor', `vendor-[chunkHash].js`),
        new HTMLWebpackPlugin({
          inject: false,
          template: '!!sitepack-template!'+paths.siteHTML,
          page: { title: 'Sitepack' },
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

    sitepack: {
      root: paths.packageRoot,
    },
  }
}
