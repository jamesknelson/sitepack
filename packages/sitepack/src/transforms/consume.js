import { warning } from '../utils/warning'


export default function consume(optionNames) {
  if (!Array.isArray(optionNames) || !optionNames.every(item => typeof item === 'string')) {
    throw new Error(`Expected the argument to Transforms.consume to be an array of strings. Instead received "${optionNames}".`)
  }

  return site => site.map(page => page.consume(...optionNames))
}
