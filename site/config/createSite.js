/**
 * Sitepack uses the function exported by this file to create the Site object
 * that is passed to your `<Application>` element in `main.js` and
 * `renderToString.js`
 *
 * The Site object is created by passing your site's root Page to `createSite`.
 * To get your root Page object, just `require()` it.
 *
 * The resultant `Site` object has two properties:
 * 
 * - `rootPage`, the Page which sits at the root of your site
 * - `pages`, an object which contains all Pages within your site
 *
 * Actually, all of the pages in `pages` are also available under `rootPage` --
 * they're just located under the `children` or `content` of another page.
 *
 * ---
 * 
 * Because Sites and Pages are just JavaScript objects, they can be passed to
 * functions like any other JavaScript object. Functions that take a `Site` and
 * return a new `Site` are called **Transforms**.
 *
 * You can pass a transform to `createSite` as its second argument. Of course,
 * you'll often want to perform more than one transform on a Site. You can do
 * this with the `createSiteTransformer` function, which combines multiple
 * transforms into a single transform that runs through its arguments in order.
 *
 * Sitepack provides a number of useful transforms that allow you to add and
 * modify your Page's options.
 */

import '../src/global.less'
import React from 'react'
import { createSite, createSiteTransformer, Transforms, isContentGetter, createContentGetter } from 'sitepack'
import { sitepackReactTransform } from 'sitepack-react'
import { createLinkConverter } from 'sitepack-mdx-page-loader/mdx-link-transform'


const convertLinks = function (site) {
  const convertLinks = createLinkConverter(site)

  return site.map(function (page) {
    const convert = (originalContent) =>
      isContentGetter(originalContent)
        ? createContentGetter(function() { return originalContent().then(function (content) { return convertLinks(page, content) }) })
        : convertLinks(page, originalContent)

    var overrideContent = page.content
    if (/\.mdx?$/.test(page.id)) {
      overrideContent = convert(page.content)
    }

    return page.override({ content: overrideContent })
  })
}


export default ({ environment }) => {
  const siteTransformer = createSiteTransformer(
    Transforms.addDefaultsByPattern({
      test: /content.*\.mdx?$/,
      options: {
        wrapper: 'Article',
      },
    }),
    Transforms.addDefaultsByPattern({
      test: /\.component\.jsx?$/,
      options: {
        wrapper: 'Component',
      },
    }),

    // Add metadata used by the elements provided by `sitepack-react`,
    // including `<Router>`, `<Link>` and `<PageContentLoader>`.
    sitepackReactTransform(),

    // Convert MDX links from page ids to pathnames
    convertLinks,

    Transforms.consume([
      'author',
    ]),

    // Convert `wrapper` strings into React components by requiring a
    // file based on the string.
    Transforms.consumeByMap(
      'wrapper',
      wrapper => wrapper && require('../src/wrappers/'+wrapper+'.wrapper.js').default
    ),
  )

  // Create a Site object whose root page will be the Page described by
  // `../content/index.page.js`.
  //
  // This Site object will be passed through each of the transforms
  // defined above, from top to bottom.
  const site = createSite(require('../src/content/index.page.js'), siteTransformer)

  return site
}

