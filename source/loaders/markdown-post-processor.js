import React from 'react'


export default function markdownPostProcessor(component) {
  const postProcessor = (page, pages) => {
    function getSiteHref(href) {
      if (href && href.indexOf('://') === -1 && href[0] !== '#') {
        const [id, hash] = href.split('#')
        const linkedPage = pages[id]
        if (linkedPage) {
          let newHref = linkedPage.absolutePath
          if (hash) newHref += '#'+hash
          return newHref
        }
        else {
          console.warn(`Link "${id}" from markdown file "${page.id}" was a 404!`)
          return '#'
        }
      }
      else {
        return href
      }
    }

    return function MarkdownDocument({ factories={}, ...others }) {
      const a = factories.a || React.createFactory('a')

      return component({
        factories: {
          a: (props, children) => {
            const href = getSiteHref(props.href)
            return a({ ...props, href }, children)
          }
        }
      })
    }
  }

  postProcessor.__SITEPACK_POST_PROCESSOR = true

  return postProcessor
}
