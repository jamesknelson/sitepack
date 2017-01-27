import './loadServiceWorker'
import createBrowserHistory from 'history/createBrowserHistory'
import React from 'react'
import ReactDOM from 'react-dom'

import { configurePage, getRootSite, getApplicationComponent } from 'sitepack-config'

const history = createBrowserHistory()

const site = getRootSite().initialize(page => Object.assign(page, configurePage(page)))
const Application = getApplicationComponent()

ReactDOM.render(
  React.createElement(Application, {
    history: history,
    site: site,
  }),
  document.getElementById('app')
)

