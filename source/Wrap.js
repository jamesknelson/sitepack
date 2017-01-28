function joinPaths(x, y) {
  if (!x || x == '/') return y
  return x + y
}

function wrap(type, id, pathname, meta, content) {
  const page = typeof meta == 'function' ? {} : meta

  if (content) {
    page.content = content
  }

  const api = {
    set: function(data) {
      Object.assign(page, data)
      return api
    },

    get: function(pages, processors=[], patterns=[], parent=undefined) {
      const pattern = function(pattern, data) {
        patterns.push([pattern, data])
      }

      if (typeof meta == 'function') {
        if (!pages) {
          throw new Error("You cannot include a SITE.js file as another SITE.js file's content.")
        }
        Object.assign(page, meta(pattern))
      }

      const contentFn = page.content

      if (page.content && typeof page.content.get == 'function') {
        Object.assign(page, contentFn.get(null, processors.slice(0), patterns.slice(0)))
        page.contentId = page.id
      }
      else {
        page.contentId = id 
      }

      page.parent = parent
      page.id = id
      if (pages) {
        page.relativePath = '/'+(page.path ? page.path : id.replace(/\.[a-zA-Z\.]+$/, '').split('/').reverse()[0])
        page.absolutePath = joinPaths(page.parent && page.parent.absolutePath, page.relativePath)
      }

      if (page.index) {
        const index = page.index

        let lastPage
        for (var i = 0, len = index.length; i < index.length; i++) {
          const child = index[i]

          let childPage
          if (child != contentFn) {
            childPage = index[i] = child.get(pages, processors.slice(0), patterns.slice(0), page)
          }
          else {
            childPage = index[i] = page
          }

          if (!('previous' in childPage) && i !== 0) {
            childPage.previous = index[i - 1]
          }
          if (lastPage) {
            lastPage.next = childPage
          }
          lastPage = childPage
        }
      }
      
      for (let [pattern, patternData] of patterns) {
        if (pattern.test(pathname)) {
          Object.assign(page, patternData)
        }
      }

      if (pages) {
        for (let processor of processors) {
          processor(page)
        }

        if (pages[id]) {
          return Object.assign(pages[id], page)
        }
        else {
          pages[id] = page
          return page
        }
      }
      else {
        return page
      }
    },

    initialize: function(processor) {
      const pages = {}
      const processors = [processor]
      const rootPage = api.get(pages, processors)

      // Content may sometimes need to be modified based on information stored
      // in the site tree. For example, rewriting links from a format which
      // points to files on the filesystem, to actual URLs.
      const pageIds = Object.keys(pages)
      for (let i = 0; i < pageIds.length; i++) {
        const page = pages[pageIds[i]]

        if (typeof page.content === 'function') {
          if (!page.content.__SITEPACK_PROMISE) {
            page.content = page.content(page, pages)
          }
          else {
            const originalFn = page.content
            page.content = function(...args) {
              return originalFn(...args).then(content => {
                if (typeof content === 'function') {
                  return content(page, pages)
                }
                else {
                  return content
                }
              })
            }
          }
        }
      }

      return {
        pages: pages,
        root: rootPage,
      }
    },
  }

  return api
}

export function wrapSite(id, pathname, meta) {
  return wrap('site', id, pathname, meta);
}

export function wrapEagerContent(id, pathname, meta, content) {
  return wrap('eager', id, pathname, meta, content);
}

export function wrapLazyContent(id, pathname, meta, contentPromise) {
  return wrap('lazy', id, pathname, meta, contentPromise);
}

