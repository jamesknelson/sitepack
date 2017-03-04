import warning from './utils/warning'
import { Page } from './Page'


function joinPaths(x, y) {
  if (!x || x == '/') return y
  return x + y
}


function createId(relativePath) {
  const basename = path.basename(relativePath)

  const dirname = path.dirname(relativePath).replace(/^[\./]+/, '')
  if (basename == 'SITE.js') {
    return '/'+dirname
  }
  else {
    return '/'+(dirname ? (dirname+'/') : '')+basename
  }
}
function getDefaultPath(page, parentId) {
  let remainingParentId = parentId
  let path = page.id
  while (path[0] === remainingParentId[0]) {
    remainingParentId = remainingParentId.slice(1)
    path = path.slice(1)
  }

  return path
    .replace(/\/index\.page\.js$/, '')
    .replace(/\.page\.js$/, '')
    .replace(/\.[a-z0-9]+$/, '')
}


class Site {
  constructor(rootPage, pages) {
    if (!pages) {
      this.pages = {}
      this.rootPage = this._registerPage(rootPage)
    }
    else {
      this.pages = pages
      this.rootPage = rootPage
    }
    Object.freeze(this)
  }

  map(callback) {
    const newPages = {}
    const rootNode = this._mapPage(this.rootPage, callback)
    return new Site(this._mapNode(rootNode, newPages), newPages)
  }

  _mapPage(page, callback) {
    const node = {}
    // Ensure that a page's children are mapped before it is, as this allows
    // map functions to build a tree as they go.
    if (page.content instanceof Page) {
      node.content = this._mapPage(page.content, callback)
    }
    if (page.children) {
      node.children = page.children.map(child => this._mapPage(child, callback))
    }
    node.page = callback(page)
    if (node.page.children !== page.children) {
      throw new Error('Sitepack does not yet support transforming Page.children')
    }
    if (node.page.content !== page.content && (node.page.content instanceof Page || page.content instanceof Page)) {
      throw new Error('Sitepack does not yet support transforming Page.content to or from a Page object')
    }
    return node
  }

  _mapNode(node, newPages, parentPath) {
    const page = node.page
    const absolutePath = joinPaths(parentPath, page.path)
    let newOptions = {}
    if (page.absolutePath && absolutePath !== page.absolutePath) {
      newOptions.absolutePath = absolutePath
    }
    if (node.children) {
      newOptions.children = node.children.map(node => this._mapNode(node, newPages, absolutePath))
    }
    if (node.content) {
      newOptions.content = this._mapNode(node.content, newPages, absolutePath)
    }
    const newPage = new Page(page.id, Object.assign({}, page, newOptions), page._consumed)
    newPages[page.id] = newPage
    return newPage
  }

  _finalize() {
    const pages = {}
    const rootPage = this._finalizePage(this.rootPage, pages)
    return Object.freeze({ pages, rootPage })
  }

  _finalizePage(page, pages, paths={}) {
    if (page.absolutePath) {
      if (paths[page.absolutePath]) {
        throw new Error(`Page "${page.id}" and "${paths[page.absolutePath]}" both have the same path, "${page.absolutePath}"!`)
      }
      paths[page.absolutePath] = page.id
    }

    const children =
      page.children &&
      page.children.map(child => this._finalizePage(child, pages, paths))
    const content =
      !(page.content instanceof Page)
        ? page.content
        : this._finalizePage(page.content, pages, paths)

    const finalizedPage = page._finalize({ children, content })
    pages[page.id] = finalizedPage
    return finalizedPage
  }

  _registerPage(page, parentId, parentPath, isContent) {
    if (this.pages[page.id]) {
      throw new Error(`Page "${page.id}" was included in your Site tree twice!`)
    }

    const registeredOptions = Object.assign({}, page)
    if (!parentId && !page.path) {
      registeredOptions.path = '/'
    }
    else if (!page.path) {
      registeredOptions.path = getDefaultPath(page, parentId)
    }
    if (!isContent) {
      registeredOptions.absolutePath = joinPaths(parentPath, page.path || registeredOptions.path)
    }
    if (page.content instanceof Page) {
      registeredOptions.content = this._registerPage(page.content, page.id, registeredOptions.absolutePath, true)
    }
    if (page.children) {
      registeredOptions.children = page.children.map(childPage => this._registerPage(childPage, page.id, registeredOptions.absolutePath))
    }

    const registeredPage = new Page(page.id, registeredOptions, page._consumed)
    this.pages[page.id] = registeredPage
    return registeredPage
  }
}


export function createSite(rootPage, transformer) {
  const site = new Site(rootPage)
  return transformer ? transformer(site) : site
}


export function createSiteTransformer(...transforms) {
    return (site) => transforms.reduce((acc, transform) => transform(acc), site)
}
