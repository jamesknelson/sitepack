import createBrowserHistory from 'history/createBrowserHistory'
import main from 'sitepack-virtual-main'
import createSite from 'sitepack-virtual-createSite'

const site = createSite({ environment: process.env.NODE_ENV })._finalize()
const history = createBrowserHistory()

main({ site, history, environment: process.env.NODE_ENV })
