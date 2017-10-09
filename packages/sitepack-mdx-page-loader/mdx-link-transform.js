var React = require('react')
var Sitepack = require('sitepack')

var isContentGetter = Sitepack.isContentGetter
var createContentGetter = Sitepack.createContentGetter


function createLinkConverter(site) {
  function getSiteHref(page, href) {
    if (href && href.indexOf('://') === -1 && href[0] !== '#') {
      var split = href.split('#')
      var id = split[0]
      var hash = split[1]
      var linkedPage = site.pages[id]
      if (linkedPage) {
        var newHref = linkedPage.absolutePath
        if (hash) newHref += '#'+hash
        return newHref
      }
      else {
        console.warn('Link "'+id+'" from markdown file "'+page.id+'" was a 404!')
        return '#'
      }
    }
    else {
      return href
    }
  }

  return function convertLinks(page, component) {
    return function MDXDocument(props) {
      var factories = props.factories || {}

      var a = factories.a || React.createFactory('a')

      return component(Object.assign({}, props, {
        factories: Object.assign(
          {},
          factories,
          {
            a: function (props) {
              var children = Array.prototype.slice.call(arguments).slice(1);
              var href = getSiteHref(page, props.href)
              return a.apply(null, [Object.assign({}, props, { href: href })].concat(children))
            },
          }
        )
      }))
    }
  }
}


module.exports = function convertMDXLinkPaths(pattern) {
  if (!(pattern instanceof RegExp)) {
    throw new Error('Expected argument to convertMDXLinkPaths to be a RegExp. Instead received "'+pattern+'}".')
  }

  return function (site) {
    const convertLinks = createLinkConverter(site)

    return site.map(function (page) {
      if (!pattern.test(page.id)) {
        return page
      }

      var originalContent = page.content
      var overrideContent =
        isContentGetter(originalContent)
          ? createContentGetter(function() { return originalContent().then(function (content) { return convertLinks(page, content) }) })
          : convertLinks(page, originalContent)

      return page.override({ content: overrideContent })
    })
  }
}

module.exports.createLinkConverter = createLinkConverter