import { warning } from '../utils/warning'


export default function consumeByMap(key, getter) {
  if (typeof key !== 'string' || key === '') {
    throw new Error('Expected the first argument to Transforms.consumeByMap to be a non-empty string.')
  }
  if (typeof getter !== 'function') {
    throw new Error('Expected the second argument to Transforms.consumeByMap to be a function.')
  }

  return site => site.map(page => page.consume(key).override({ [key]: getter(page[key]) }))
}
