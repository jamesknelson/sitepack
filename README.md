# Sitepack

*Sitepack is currently a protoype, and not yet properly documented.*

Sitepack is a tool for building hybrid websites with React and Webpack. It gives you the full power of React to build your application, while also giving you out-of-the-box support for static rendering. With Sitepack, you get the best of both worlds!

## Example

To see Sitepack in the wild, check out the `site` directory of the [Junctions](https://github.com/jamesknelson/junctions/tree/master/site) router project. This site can be viewed live at [junctions.js.org](https://junctions.js.org).

## Overview

Sitepack is based around three assumptions:

1. Your site's structure and metadata can be represented as a single JavaScript object
2. Your content can be lazy or eager loaded based on information in this object
3. Given a URL and this `Site` object, a single React component can render your application

Sitepack provides tools to create static-rendered websites which follows these assumptions, including:

1. **`SITE.js` files:** A format to specify structure and metadata using plain JavaScript objects and `require()` statements
2. **`sitepack.config.js` files:** A format to provide global configuration for your site
3. **The `sitepack` command:** A command line utility to build and serve a site

### SITE.js files

Sitepack is based around `SITE.js` files. These files let you specify the structure and metadata of your site using modules and `require()` statements. Here is an example of a `SITE.js` file from the [Junctions JS website](https://github.com/jamesknelson/junctions/tree/master/docs):

```js
// SITE.js

module.exports = {
  title: 'Guide',
  path: 'guide',
  indexWrapper: 'MenuWrapper',
  content: require('./quick-start.md'),
  index: [
      require('./quick-start.md'),
      require('./introduction/SITE.js'),
      require('./basics/SITE.js'),
      require('./advanced/SITE.js'),
      require('./Glossary.md'),
  ],
}
```

Sitepack will take the `SITE.js` file that is specified in your special `sitepack.config.js`, and then create a `site` object from it that holds an object representing your root page, and a list of all pages:

```
// Site object

{
  root: {
    id: '/pathname/of/source/file',
    ...
  },
  pages: {
    [id]: Page,
  }
}
```

It will then pass your `site` object, as well as the current URL, into an `Application` component which you configure in `sitepack.config.js`.

## sitepack.config.js

This file must specify three functions:

```
// A function that returns your application's root React component
export function getApplicationComponent() {
  return require('./Application').default
}

// A function that returns your applicaion's root `SITE.js` file
export function getRootSite() {
  return require('../SITE.js')
}

// A function that can add extra information to each Page object.
// This function can just return the page as-is.
export function configurePage(page) {
  return page;
}
```

## The `sitepack` command

TODO
