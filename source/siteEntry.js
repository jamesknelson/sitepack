import { configurePage, getRootSite, getApplicationComponent } from 'sitepack-config'

export default  getRootSite().initialize(page =>
  Object.assign(page, configurePage(page))
)
