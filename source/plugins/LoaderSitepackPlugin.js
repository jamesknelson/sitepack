export default class LoaderSitepackPlugin {
  constructor(options) {
    this.sitepack = options;
  }

  apply(compiler) {
    compiler.plugin("compilation", (compilation) => {
      compilation.plugin("normal-module-loader", (loaderContext) => loaderContext.sitepack = this.sitepack)
    })
  }
}
