import warning from './utils/warning'


export class Page {
  static RESERVED_OPTIONS = ['absolutePath', 'consume', 'id', 'override', 'set']

  constructor(id, options, consumed) {
    this.id = id

    Object.assign(this, options)

    // Ensure paths always start with '/'
    if (options.path) {
      this.path = options.path[0] === '/' ? options.path : '/' + options.path
    }

    Object.defineProperty(this, '_consumed', { value: consumed })
    Object.freeze(this)
  }

  consume(...keys) {
    const duplicateKeys = keys.filter(key => this._consumed.indexOf(key) !== -1)
    if (duplicateKeys.length !== 0) {
      warning(`You consumed the options ${duplicateKeys.map(x => `"${x}"`).join(', ')} in page "${this.id}" multiple times!`)
    }
    return new Page(this.id, this, this._consumed.concat(keys))
  }

  override(options) {
    this._validateOptions(options)
    return new Page(this.id, { ...this, ...options }, this._consumed)
  }

  set(options) {
    for (let key of Object.keys(options)) {
      if (this._consumed.indexOf(key) !== -1 && key in this) {
        warning(`The key "${key}" in page "${this.id}" was set twice!`)
      }
    }
    return this.override(options)
  }

  _finalize(options) {
    for (let key of Object.keys(this)) {
      if (key !== 'id' && this._consumed.indexOf(key) === -1) {
        warning(`They key "${key}" in page "${this.id}" is not recognised by any transforms!`)
      }
    }

    const page = { ...this, ...options }

    Object.defineProperty(page, '__SITEPACK_PAGE', { value: true })

    // Our final page doesn't need all the cruft of a Page object -- a plain
    // old JavaScript object is fine.
    return Object.freeze(page)
  }

  _validateOptions(options) {
    for (let key of Object.keys(options)) {
      if (key[0] === '_' || this.constructor.RESERVED_OPTIONS.indexOf(key) !== -1) {
        throw new Error(`You may not specify an "${option}" option on page "${this.id}".`)
      }
    }

    if (options.children) {
      for (let child of options.children) {
        if (!(child instanceof Page)) {
          throw new Error(`Expected all children of page "${this.id}" to be Page objects!`)
        }
      }
    }
  }
}


export function createPage(id, options, content) {
  if (content && 'content' in options) {
    warning(`You specified a "content" option for page ${id}, but it already has content! Using your specified content anyway...`)
  }
  return new Page(id, { ...options, content: content || options.content }, ['absolutePath', 'path', 'content', 'children'])
}

export function isPage(obj) {
  return obj && (obj.__SITEPACK_PAGE || obj instanceof Page)
}
