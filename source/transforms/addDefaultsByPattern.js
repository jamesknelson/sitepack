import { warning } from '../utils/warning'


export default function addDefaultsByPattern(pattern) {
  if (!pattern || typeof pattern !== 'object') {
    throw new Error(`Expected argument to Transforms.addDefaultsByPattern to be an object. Instead received "${pattern}".`)
  }
  if (Object.keys(pattern).length > 2 || !pattern.test || !('options' in pattern)) {
    warning('Expected argument to Transforms.addDefaultsByPattern to be an object containing only the two keys "test" and "options".')
  }
  if (!(pattern.test instanceof RegExp)) {
    throw new Error(`Expected "test" passed to Transforms.addDefaultsByPattern to be a RegExp. Instead received "${pattern.test}".`)
  }

  return site => site.map(page => {
    if (pattern.test.test(page.id)) {
      const uninitializedOptions = {}
      for (let key of Object.keys(pattern.options)) {
        if (!(key in page)) {
          uninitializedOptions[key] = pattern.options[key]
        }
      }
      return page.set(uninitializedOptions)
    }
    else {
      return page
    }
  })
}
