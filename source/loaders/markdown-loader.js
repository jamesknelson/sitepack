import url from 'url'
import path from 'path'
import loaderUtils from 'loader-utils'
import frontMatter from 'front-matter'
import markdownIt from 'markdown-it'
import mdAnchor from 'markdown-it-anchor'
import Prism from 'prismjs'

const aliases = {
  'js': 'jsx',
  'html': 'markup'
}

// Used to store information that the markdown plugins need to return to
// the loader itself
const env = {
  title: undefined,
  links: [],
  images: [],
}

const highlight = (str, lang) => {
  if (!lang) {
    return str
  } else {
    lang = aliases[lang] || lang
    require(`prismjs/components/prism-${lang}.js`)
    if (Prism.languages[lang]) {
      return Prism.highlight(str, Prism.languages[lang])
    } else {
      return str
    }
  }
}

const mdTitleExtractor = (md) => {
  md.core.ruler.push('titleExtractor', state => {
    const tokens = state.tokens

    let i = tokens.findIndex(token => token.type === 'heading_open')
    if (i !== -1) {
      let token
      do {
        token = tokens[i]
        tokens.splice(i, 1)
        if (token.type === 'inline') {
          env.title = token.content
        }
      } while (token.type !== 'heading_close')
    }
  })
}


function saveLink(href) {
  const number = env.links.length
  env.links.push(href)
  return "%%%SITEPACK_LINK%%%" + Math.random() + "%%%" + (number) + "%%%";
}
const mdLinkReplacer = (md) => {
  md.core.ruler.push('linkReplacer', state => {
    function applyFilterToTokenHierarchy(token) {
      if (token.children) {
        token.children.map(applyFilterToTokenHierarchy);
      }

      if (token.type === 'link_open') {
        const href = token.attrGet('href')

        if (href.indexOf('://') !== -1 || href[0] == '#') return;

        const id = saveLink(href);
        token.attrSet('href', id);
      }
    }

    state.tokens.map(applyFilterToTokenHierarchy);
  })
}


function saveImage(src) {
  const number = env.images.length
  env.images.push(src)
  return "%%%SITEPACK_IMAGE%%%" + Math.random() + "%%%" + (number) + "%%%";
}
const mdImageReplacer = (md) => {
  md.core.ruler.push('imageReplacer', state => {
    function applyFilterToTokenHierarchy(token) {
      if (token.children) {
        token.children.map(applyFilterToTokenHierarchy);
      }

      if (token.type === 'image') {
        const src = token.attrGet('src')

        if(!loaderUtils.isUrlRequest(src)) return;

        var uri = url.parse(src);
        uri.hash = null;
        const id = saveImage(uri.format());
        token.attrSet('src', id);
      }
    }

    state.tokens.map(applyFilterToTokenHierarchy);
  })
}


const md = markdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight
})
  .enable([ 'link' ])
  .use(mdImageReplacer)
  .use(mdLinkReplacer)
  .use(mdTitleExtractor)
  .use(mdAnchor, {
    permalink: true,
    permalinkSymbol: '#',
    permalinkBefore: true
  })

module.exports = function markdownLoader(content) {
  // Not cacheable due to metadata
  // this.cacheable()
  
  const data = frontMatter(content)

  env.title = undefined
  env.images = []
  env.links = []

  // This will run the plugins defined above, which store information in the
  // global `env` variable.
  const html = JSON.stringify(md.render(data.body))

  const body = html
    .replace(/%%%SITEPACK_IMAGE%%%[0-9\.]+%%%([0-9]+)%%%/g, (_, match) => {
      const src = env.images[match]
      
      if(!src) return ''

      return '" + require(' + JSON.stringify(loaderUtils.urlToRequest(src)) + ') + "';
    })
    .replace(/%%%SITEPACK_LINK%%%[0-9\.]+%%%([0-9]+)%%%/g, (_, match) => {
      const href = env.links[match]
      
      if(!href) return ''

      const absoluteUrl =
        href[0] === '/'
          ? href
          : '/' + path.relative(this.options.sitepack.root, path.join(this.resourcePath, '..', href))

      return '%%%SITEPACK_LINK%%%' + absoluteUrl + '%%%END_SITEPACK_LINK%%%'
    })


  // Pass metadata to Sitepack by setting it on the loader's `value`
  const meta = data.attributes
  if (!meta.title) {
    meta.title = env.title 
  }
  this.value = {
    meta: meta,
  }

  return `
    module.exports = require('sitepack').markdownPostProcessor(${body});
  `;
}
