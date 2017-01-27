var path = require('path');

function resolveSite(appDirectory, relativePath) {
  return path.resolve(appDirectory, relativePath);
}

function resolveOwn(relativePath) {
  return path.resolve(__dirname, relativePath);
}

export default function getPaths(packageRoot, siteRoot, output) {
  var nodePaths = (process.env.NODE_PATH || '')
    .split(process.platform === 'win32' ? ';' : ':')
    .filter(Boolean)
    .filter(folder => !path.isAbsolute(folder))
    .map(resolveSite.bind(null, packageRoot));

  const paths = {
    packageRoot,
    siteRoot,
    nodePaths,

    siteConfig: resolveSite(siteRoot, 'sitepack.config.js'),
    sitePublic: resolveSite(siteRoot, 'public'),
    siteBuild: resolveSite(packageRoot, output || 'build'),
    siteHTML: resolveSite(siteRoot, 'index.html.ejs'),
    siteNodeModules: resolveSite(packageRoot, 'node_modules'),

    // this is empty with npm3 but node resolution searches higher anyway:
    ownNodeModules: resolveOwn('../../node_modules'),
    ownLoaders: resolveOwn('../loaders')
  }

  return paths
};
