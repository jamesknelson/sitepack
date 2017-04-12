import createBrowserHistory from 'history/createBrowserHistory'
import main from 'sitepack-virtual-main'
import createSite from 'sitepack-virtual-createSite'

const history = createBrowserHistory()
Promise.resolve()
  .then(() => createSite({ environment: process.env.NODE_ENV }))
  .then(site => site._finalize())
  .then(site => main({ site, history, environment: process.env.NODE_ENV }))
