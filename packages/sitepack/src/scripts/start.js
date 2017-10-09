import chalk from 'chalk'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import errorOverlayMiddleware from 'react-dev-utils/errorOverlayMiddleware'
import { getAppConfig } from '../config/webpack.config'
import getPaths from '../config/paths'


export default function start({ port, siteRoot, packageRoot, config }) {
  const paths = getPaths(packageRoot, siteRoot, config.paths);

  const webpackConfig = getAppConfig({
    environment: process.env.NODE_ENV,
    config,
    paths,
  })

  const options = {
    clientLogLevel: 'info',
    contentBase: paths.public,

    historyApiFallback: true,

    hot: true,
    host: '0.0.0.0',

    overlay: false,

    port,

    // It is important to tell WebpackDevServer to use the same "root" path
    // as we specified in the config. In development, we always serve from /.
    publicPath: '/',

    // See https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/config/webpackDevServer.config.js
    setup(app) {
      app.use(errorOverlayMiddleware());
    },
  }

  let compiler
  try {
    compiler = webpack(webpackConfig);
  }
  catch (e) {
    console.error(e.message)
    process.exit(1)
  }

  const devServer = new WebpackDevServer(compiler, options);

  devServer.listen(port, (err, result) => {
    if (err) {
      return console.log(err);
    }

    console.log(chalk.cyan('Starting the development server...'));
  });
}
