import ExecutionEnvironment from 'exenv'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import ReactDOMServer from 'react-dom/server'
import { isContentGetter } from 'sitepack'


export default class PageContentLoader extends Component {
  static propTypes = {
    page: PropTypes.shape({
      id: PropTypes.string.isRequired,
      content: PropTypes.any,
    }).isRequired,
    render: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.func,
    ]).isRequired,
  }

  constructor(props) {
    super(props)

    this.pageId = 'Sitepack-PageContentLoader-'+props.page.id.replace(/[^\w-]/g, '_')
    this.state = {}
    if (ExecutionEnvironment.canUseDOM) {
      const el = document.getElementById(this.pageId)
      if (el && el.innerHTML) {
        this.state.string = el.innerHTML
      }
    }
  }

  hydrate = () => {
    if (!this.hydrated) {
      this.hydrated = true
      ReactDOM.hydrate(this.renderContent(), this.container)
      return true
    }
  }
  componentDidMount() {
    if (!this.delayHydrate && this.state.string && this.props.page.content) {
      this.hydrate()
      ReactDOM.hydrate(this.renderContent(), this.container)
    }
  }
  componentDidUpdate() {
    if (this.state.string && this.props.page.content) {
      if (!this.hydrate()) {
        ReactDOM.render(this.renderContent(), this.container)
      }
    }
  }

  componentWillMount() {
    this.setPageState(this.props.page, true)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.page !== this.props.page) {
      this.setPageState(nextProps.page)
    }
  }

  setPageState(page, canDelayHydrate) {
    this.id = page.id

    // TODO: delay hydrating until next tick if we have to do this.

    if (isContentGetter(page.content)) {
      page.content().then(
        (content) => {
          if (this.id === page.id) {
            this.setState({ isLoading: false, content })
          }
        },
        (error) => {
          console.error("Error loading content with <Loader />:", error)
          if (this.id === page.id) {
            this.setState({ isLoading: false, content: undefined, error })
          }
        }
      )
      this.setState({ isLoading: true, content: undefined })

      if (this.state.string && canDelayHydrate) {
        this.delayHydrate = true
        setTimeout(this.hydrate)
      }
    }
    else {
      this.setState({ isLoading: false, content: page.content })
    }
  }

  componentWillUnmount() {
    this.id = null
    if (this.state.string) {
      try {
        ReactDOM.unmountComponentAtNode(this.container)
      } catch (e) { }
    }
  }

  setContainer = (el) => {
    this.container = el
  }

  renderContent() {
    const state = this.state
    const props = {
      env: this.props.env,
      page: this.props.page,
      key: this.props.page.id,
      isLoading: state.isLoading,
      content: state.content,
      error: state.error,
    }

    return (
      typeof this.props.render == 'function'
        ? this.props.render(props)
        : React.cloneElement(this.props.render, props)
    )
  }

  render() {
    const props = this.props
    const state = this.state

    if (!ExecutionEnvironment.canUseDOM) {
      const content = this.renderContent()
      const string = ReactDOMServer.renderToString(content)
      return <div ref={this.setContainer} className={props.className} style={props.style} id={this.pageId} dangerouslySetInnerHTML={{ __html: string }} />
    }
    else if (state.string) {
      return <div ref={this.setContainer} className={props.className} style={props.style} id={this.pageId} dangerouslySetInnerHTML={{ __html: state.string }} />
    }
    else {
      return <div ref={this.setContainer} className={props.className} style={props.style}>{this.renderContent()}</div>
    }
  }
}
