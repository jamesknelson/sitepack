const frontMatter = require('front-matter')
const markdownIt = require('markdown-it')
const mdAnchor = require('markdown-it-anchor')
const Prism = require('prismjs')

const aliases = {
  'js': 'jsx',
  'html': 'markup'
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

const env = {}
const mdTitle = (md) => {
  md.core.ruler.push('title', state => {
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

const mdLinkResolver = (md) => {
  md.core.ruler.push('linkResolver', state => {
    function applyFilterToTokenHierarchy(token) {
      if (token.children) {
        token.children.map(applyFilterToTokenHierarchy);
      }

      if (token.type === 'link_open') {
        const href = token.attrGet("href")
        token.attrSet("href", '%SITEPACK_LINK%'+href+'%END_SITEPACK_LINK%')
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
  .use(mdLinkResolver)
  .use(mdTitle)
  .use(mdAnchor, {
    permalink: true,
    permalinkSymbol: '#',
    permalinkBefore: true
  })

module.exports = function markdownLoader(content) {
  // Not cacheable due to metadata
  // this.cacheable()
  
  const meta = frontMatter(content)
  this.value = {
    body: md.render(meta.body, env),
    meta: meta.attributes,
  }
  if (!this.value.meta.title) {
    this.value.meta.title = env.title
  }
  delete env.title
  return this.value.body
}
