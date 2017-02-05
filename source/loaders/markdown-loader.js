import url from 'url'
import path from 'path'
import loaderUtils from 'loader-utils'
import frontMatter from 'front-matter'
import mdAnchor from 'markdown-it-anchor'
import Prism from 'prismjs'
import MDXIt from 'mdx-it'


const env = {};


const aliases = {
  'js': 'jsx',
  'html': 'markup'
}
function highlight(str, lang) {
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


function mdTitleExtractor(md) {
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

function mdImageReplacer(md) {
  md.core.ruler.push('imageReplacer', function(state) {
    function applyFilterToTokenHierarchy(token) {
      if (token.children) {
        token.children.map(applyFilterToTokenHierarchy);
      }

      if (token.type === 'image') {
        const src = token.attrGet('src')

        if(!loaderUtils.isUrlRequest(src)) return;

        const uri = url.parse(src);
        uri.hash = null;
        token.attrSet('src', { __jsx: 'require("'+uri.format()+'")' });
      }
    }

    state.tokens.map(applyFilterToTokenHierarchy);
  })
}

function mdLinkReplacer(sitepackRoot, resourcePath) {
  return (md) => {
    md.core.ruler.push('linkReplacer', function(state) {
      function applyFilterToTokenHierarchy(token) {
        if (token.children) {
          token.children.map(applyFilterToTokenHierarchy);
        }

        if (token.type === 'link_open') {
          const href = token.attrGet('href');

          if (href.indexOf('://') !== -1 || href[0] == '#') return;

          const absoluteHref =
            href[0] === '/'
              ? href
              : '/' + path.relative(sitepackRoot, path.join(resourcePath, '..', href))

          token.attrSet('href', absoluteHref);
        }
      }

      state.tokens.map(applyFilterToTokenHierarchy);
    })
  }
}


module.exports = function markdownLoader(content) {
  this.cacheable();

  const options = loaderUtils.parseQuery(this.query);

  if (options.linkify === undefined) options.linkify = true;
  if (options.typographer === undefined) options.typographer = true;
  if (options.highlight === undefined) options.highlight = highlight;

  const md =
    new MDXIt(options)
      .enable(['link'])
      .use(mdImageReplacer)
      .use(mdLinkReplacer(this.options.sitepack.root, this.resourcePath))
      .use(mdTitleExtractor)
      .use(mdAnchor);

  const data = frontMatter(content);
  const body = md.render(data.body, env);

  // Pass metadata to Sitepack by setting it on the loader's `value`
  const meta = data.attributes
  if (!meta.title) {
    meta.title = env.title 
  }

  // Make the plain body and meta available to the next loader
  this.value = { meta, body };

  return `${this.value.body}
module.exports = require('sitepack').markdownPostProcessor(module.exports);
module.exports.meta = ${JSON.stringify(this.value.meta, null, 2)}
`;
}
