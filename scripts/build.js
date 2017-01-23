export default function build({ config, dest }) {
  // - use webpack to build application bundle w/ lazy loaded site object
  // - use webpack to build a file exporting config.getRootSite() w/ eager loading turned on,
  //   and save output CSS
  // - require the eager-loaded site object
  // - loop through all pages, built an in memory history for each
  // - pass eager loaded site and each history to Application component and render to string
  // - for each page, pass page object, content, css, app bundle and bootstrap script to template then write to disk
}
