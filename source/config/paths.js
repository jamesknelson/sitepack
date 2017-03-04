import path from 'path'

function resolveSite(appDirectory, relativePath) {
  return path.resolve(appDirectory, relativePath)
}

function resolveOwn(relativePath) {
  return path.resolve(__dirname, relativePath)
}

export default function getPaths(packageRoot, siteRoot, configPaths, output) {
  var nodePaths = (process.env.NODE_PATH || '')
    .split(process.platform === 'win32' ? ';' : ':')
    .filter(Boolean)
    .filter(folder => !path.isAbsolute(folder))
    .map(resolveSite.bind(null, packageRoot))

  return {
    packageRoot,
    siteRoot,
    nodePaths,

    html: resolveSite(siteRoot, configPaths.html || 'index.html.ejs'),
    loaders: resolveSite(siteRoot, configPaths.loaders || 'loaders'),
    main: resolveSite(siteRoot, configPaths.main || 'main.js'),
    nodeModules: resolveSite(packageRoot, 'node_modules'),
    output: resolveSite(siteRoot, output || configPaths.output || 'build'),
    public: resolveSite(siteRoot, configPaths.public || 'public'),
    renderToString: resolveSite(siteRoot, configPaths.renderToString || 'renderToString.js'),
    createSite: resolveSite(siteRoot, configPaths.site || 'createSite.js'),

    // this is empty with npm3 but node resolution searches higher anyway:
    ownNodeModules: resolveOwn('../../node_modules'),
    ownLoaders: resolveOwn('../loaders')
  }

  return paths
};
