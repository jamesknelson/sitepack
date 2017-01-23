import './loadServiceWorker'
import createBrowserHistory from 'history/createBrowserHistory'
import React from 'react'
import ReactDOM from 'react-dom'

import { configurePage, getRootSite, getApplicationComponent } from 'sitepack-config'

const history = createBrowserHistory()

// TODO: don't set this in web file, as it should be set in the static HTML for whatever
// page was rendered.
window.$site = getRootSite().initialize(page => Object.assign(page, configurePage(page)))

const Application = getApplicationComponent()

ReactDOM.render(
  React.createElement(Application, {
    history: history,
    site: window.$site,
  }),
  document.getElementById('app')
)

