export { createPage, isPage } from './Page'
export { createSite, createSiteTransformer } from './Site'

import { Page } from './Page'

import addDefaultsById from './transforms/addDefaultsById'
import addDefaultsByPattern from './transforms/addDefaultsByPattern'
import consume from './transforms/consume'
import consumeByMap from './transforms/consumeByMap'

export const Transforms = {
  addDefaultsById,
  addDefaultsByPattern,
  consume,
  consumeByMap
}


export function isContentGetter(obj) {
  return typeof obj === 'function' && obj.__SITEPACK_CONTENT_GETTER
}
export function createContentGetter(func) {
  Object.defineProperty(func, '__SITEPACK_CONTENT_GETTER', { value: true })
  return func
}
