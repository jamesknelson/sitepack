import { warning } from '../utils/warning'


export default function addDefaultsById(extractor) {
  if (typeof extractor !== 'function') {
    throw new Error('Expected the argument to Transforms.addDefaultsById to be a function.')
  }

  return site => site.map(page => {
    const options = extractor(page.id)
    if (typeof options !== 'object') {
      warning(`Expected the function passed to Transforms.addDefaultsById to return an object, or null. Instead received "${options}".`)
    }
    const uninitializedOptions = {}
    for (let key of Object.keys(options)) {
      if (!(key in page)) {
        uninitializedOptions[key] = options[key]
      }
    }
    return page.set(uninitializedOptions)
  })
}
