import React, { Component, PropTypes } from 'react'


export default class PageContentLoader extends Component {
  static propTypes = {
    page: PropTypes.shape({
      id: PropTypes.string.isRequired,
      content: PropTypes.any,
    }).isRequired,
    render: PropTypes.element.isRequired,
  }

  componentWillMount() {
    this.setPageState(this.props.page)
  }

  componentWillReceiveProps(nextProps) {
    this.setPageState(nextProps.page)
  }

  setPageState(page) {
    this.id = page.id

    if (typeof page.content == 'function') {
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
    }
    else {
      this.setState({ isLoading: false, content: page.content })
    }
  }

  componentWillUnmount() {
    this.id = null
  }

  render() {
    if (typeof this.props.render == 'function') {
      return this.props.render(this.state)
    }
    else {
      return React.cloneElement(this.props.render, Object.assign({ key: this.props.page.id }, this.state))
    }
  }
}
