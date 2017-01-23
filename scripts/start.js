import chalk from 'chalk'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import historyApiFallback from 'connect-history-api-fallback'
import getWebpackConfig from '../config/webpack.config'
import getPaths from '../config/paths'


export default function start({ host, port, siteRoot, packageRoot, sitepackConfig }) {
  const paths = getPaths(packageRoot, siteRoot);

  const config = getWebpackConfig({
    isProduction: process.env.NODE_ENV === 'production',
    sitepackConfig,
    paths,
    host,
    port,
  })

  const compiler = webpack(config);

  const devServer = new WebpackDevServer(compiler, {
    contentBase: paths.sitePublic,

    historyApiFallback: true,

    hot: true,

    // It is important to tell WebpackDevServer to use the same "root" path
    // as we specified in the config. In development, we always serve from /.
    publicPath: config.output.publicPath
  });

  devServer.listen(port, (err, result) => {
    if (err) {
      return console.log(err);
    }

    console.log(chalk.cyan('Starting the development server...'));
  });
}
