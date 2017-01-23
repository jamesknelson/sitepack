import createMemoryHistory from 'history/createMemoryHistory'
import ReactDOMServer from 'react-dom/server'
import Application from './components/Application.js'


export default function render(site, path) {
  const history = createMemoryHistory({
    initialEntries: [ path ],
  })

  ReactDOMServer.renderToString(
    <Application
      history={history}
      site={site}
    />
  )
}
