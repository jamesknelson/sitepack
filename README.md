# Sitepack

[![Version](http://img.shields.io/npm/v/sitepack.svg)](https://www.npmjs.org/package/sitepack)

*A tool for building static web sites, used on [React Armory](https://reactarmory.com).*

Sitepack is a JavaScript tool for creating static websites. It produces a single HTML file for each page on your site, giving you control over `<meta>` tags while providing best-in-class page load times.

Out of the box, Sitepack gives you everything you need:

- ES6 support via Babel
- CSS modules
- Source maps
- Reload-on-change during development
- Minification in production builds

You can also configure your own Webpack loaders, giving you the option of using LESS, TypeScript, or even vue files.

Sitepack is framework agnostic - it works with React, Vue, or any other JavaScript framework with render-to-string support.

## Trying it out

The easiest way to try out sitepack is to build Sitepack's own WIP documentation site:

```bash
git clone https://github.com/jamesknelson/sitepack.git
cd sitepack
yarn install
yarn build
yarn site:start
```

The source for this site is located under the `/site` directory in this repository.
