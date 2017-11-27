import React, { Component } from 'react'
import PropTypes from 'prop-types'


function isLeftClickEvent(event) {
  return event.button === 0
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
}


function defaultLinkRenderer({ Control, className, style, active, children }) {
  return React.createElement(Control, { className, style, children })
}


export default class Link extends Component {
  static propTypes = {
    env: PropTypes.shape({
      site: PropTypes.object.isRequired,
      history: PropTypes.object.isRequired,
    }).isRequired,
    exact: PropTypes.bool,
    onClick: PropTypes.func,
    page: PropTypes.string,
    href: PropTypes.string,
    target: PropTypes.string,
    render: PropTypes.func.isRequired,
  }

  static defaultProps = {
    render: defaultLinkRenderer,
    exact: false,
  }

  handleClick = (event) => {
    if (this.props.onClick) {
      this.props.onClick(event)
    }

    if (event.defaultPrevented ||
        isModifiedEvent(event) ||
        !isLeftClickEvent(event) ||
        this.props.target
    ) {
      return
    }

    const history = this.props.env.history
    const location = this.getLocation()

    if (typeof location === 'string') {
      return
    }

    event.preventDefault()

    history.push(location)
  }

  getLocation() {
    let { env, page: pageProp, href } = this.props

    if (pageProp && href) {
      console.warn('You supplied both a "page" and a "href" to <Link>. Ignoring page...')
    }

    if (href) {
      if (href.indexOf('://') !== -1 || href.indexOf('mailto:') === 0 || href[0] == '#') {
        return href
      }
      const [path, hash] = href.split('#')
      return { pathname: path, hash }
    }
    else if (pageProp) {
      const [pageId, hash] = pageProp.split('#')
      if (!env) {
        return
      }
      const page = env.site.pages[pageId]
      if (!page) {
        console.warn(`Tried to get Path for non-existent page ID "${pageId}".`)
        return
      }

      return { pathname: page.absolutePath, hash }
    }

    console.warn('Your <Link> has no "page" or "href"!')
  }

  controlComponent = (props) => {
    const { env, exact, hidden, page, render, className, style, ...other } = this.props

    const aProps = {
      ...other,
      ...props,
      onClick: this.handleClick,
    }

    const location = this.getLocation()
    if (!env) {
      console.error(`<Link> component with page "${page}" is missing its "env" prop.`)
      aProps.style = { backgroundColor: 'red' }
      aProps.href = '#'
    }
    else if (location) {
      aProps.href = typeof location === 'string' ? location : location.pathname
    }

    return React.createElement('a', aProps)
  }

  render() {
    const { env, exact, hidden, render, className, style, children } = this.props
    const location = this.getLocation() || {}

    const active =
      env && typeof location !== 'string' &&
      (exact
        ? location.pathname === env.history.location.pathname
        : env.history.location.pathname.indexOf(location.pathname) === 0)

    return render({ Control: this.controlComponent, active, className, hidden, style, children })
  }
}
