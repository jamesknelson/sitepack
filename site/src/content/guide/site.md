*This page is a little old...*

## Your Site Is An Object

Sitepack treats your entire Site as an object. It also treats each Page as an object. But where do these objects come from?

### Declaring Pages

The easiest way to get a Page object is to just create one. You'd usually do this by exporting it from a `.page.js` file within your `content` directory. For example, your site's root page may be called `index.page.js`:

```js
export default {
  title: "junctions.js",
  content: require('./index-content.md'),
  children: [
    require('./pages/guide.md'),
    require('./pages/api.md'),
  ]
}
```

Each Page object contains all of the information that is needed to render that page. This will usually include a `title` and some `content`. A `path` will also be added if you don't specify it manually.

In addition to a page's content, it can also specify *children*. Children are Page objects too. They'll be made available at a URL relative to the Page that includes them. Which brings us to one of the major differences between Sitepack and other static website generators.

Sitepack doesn't attempt to magic your content out of the filesystem and into a website. Instead, Sitepack follows `require()` statements, building exactly what you tell it to build. Your Site is a tree of Page objects. That's it.

But how is it that you can `require` an `.md` file, and you get a `Page` object? This is where Page Loaders come in.

### Page Loaders

Sitepack also gives you a powerful new tool called **Page Loaders** -- a special type of Webpack Loader that converts a content file into a `Page` object.

If you're not familiar with Webpack, all you need to know about loaders is that they let Sitepack *transform* the content of a file loaded with `require()`. In the case of Page Loaders, content is transformed into a `Page` object. For an example, the [sitepack-mdx-page-loader](https://github.com/jamesknelson/sitepack-mdx-page-loader) package contains a loader that turns Markdown into React components.

## Use Whichever Framework You'd Like

Sitepack is compatible with any JavaScript framework that knows how to render a Component to a string. This means that is Sitepack works with both [React JS](https://facebook.github.io/react/) *and* [Vue JS](https://vuejs.org/).

But how does Sitepack work this magic? Well, it actually isn't magical at all! You just need to tell Sitepack how to render your application to a string. And this is easier than it might at first sound. But don't take my word for it -- let's look at an example.

### Sitepack with React

React provides a [ReactDOMServer.renderToString()](https://facebook.github.io/react/docs/react-dom-server.html#rendertostring) function takes a React Element, and returns a string containing the element's HTML.

To use this within Sitepack, just create a `renderToString.js` file in the same directory as `sitepack.config.js` that looks something like this:

```js
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { Router } from 'sitepack-react'

export default function renderToString({ history, site }) {
  return ReactDOMServer.renderToString(
    <Router history={history} site={site} />
  )
}
```

And then create a `main.js` file in the same directory that looks something like this:

```js
import React from 'react'
import ReactDOM from 'react-dom'
import { Router } from 'sitepack-react'

export default function main({ environment, history, site }) {
  ReactDOM.render(
    <Router history={history} site={site} />,
    document.getElementById('app')
  )
}
```

Sitepack expects your `renderToString.js` file's default export to be a function that takes an object containing your `history` and `site`, and returns a string. And it runs the default export of `main.js` as soon as your page loads.

The `site` object contains your application's `Page` objects. Your entire site's content is available from here. All you need to do is select that relevant part for the current page and then display it. But how do you know what the current page is? That is where `history` comes in.

The `history` object is a `History` object from the [history](https://github.com/mjackson/history) package. It contains the URL of the page to render. You can pass this object as-is to [react-router](https://github.com/ReactTraining/react-router) or [junctions](https://junctions.js.org), or you can pass it to a `<Router>` element from **sitepack-react**.

Sitepack gives you the flexibility to use any component you'd like to handle `history` and `site`. But sometimes you'd just like to focus on your content. And that's what [sitepack-react](https://github.com/jamesknelson/sitepack-react) is for; it is a set of Components and tools that you can use to make integrating Sitepack with React a breeze.

But say you *actually* want to build a static website using React. I'll let you in on a secret. You don't actually need to touch History, Site or Router objects. They're there if need them, but you probably just want to clone [sitepack-react-starter-kit](https://github.com/jamesknelson/sitepack-react-starter-kit) and start editing your `content` directory. *It is really that simple.*
