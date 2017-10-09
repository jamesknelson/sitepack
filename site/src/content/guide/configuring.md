*This page is a little old...*

Configuring Sitepack
--------------------

Every Sitepack project has *two* configuration files, which must be in the
same directory.

- `sitepack.app.js`
- `sitepack.build.js`

These files are plain JavaScript. They're split into two so that unneeded
build configuration does not end up in your bundled JavaScript.

## App Configuration

Your app's configuration goes in `sitepack.app.js`, and allows you to configure
how the application is rendered and how the Site object is created.

This file will be bundled with your `app.js`, so try to keep imports to a
minimum.

-   initializeApplication(history, site)

    Called once when the page is loaded

    export function renderApplication() {
      const Application = require('./Application')

      ReactDOM.render(
        React.createElement(Application, {
          history: history,
          site: site,
        }),
        document.getElementById('app')
      )
    }

-   site

    The `Site` object for the website.

    ```js
    import { createSite, transformSite, validateSite, Transforms } } from 'sitepack'
    import { addJunctionsToSiteTransform } from 'sitepack-junctions'

    const transformSite = createSiteTransformer(
      // Add a `date` meta field based on each page's filename
      Transforms.extractOptionsFromFilename(filename => ({
        filename: 
        options: {
          date: 
        },
      })),

      // Add a `Junction` object to each page to facilitate routing
      addJunctionsToSiteTransform(),

      // Allow these options to be added to front-matter without emitting
      // a warning
      Transforms.recogniseOptions([
        'title',
        'author',
        'description',
      ]),

      // Set a deafult wrapper based on page filename
      Transforms.addDefaultOptionsByPattern([
        { test: /\.mdx?$/,
          options: {
            wrapper: 'MarkdownWrapper',
          },
        }
      ]),

      // Import wrapper components based on the `wrapper` metadata key
      Transforms.setOption(
        'wrapper',
        wrapper => require('./wrappers/'+wrapper+'.js').default
      ),
    )

    export const site = validateSite(transformSite(createSite(require('./content/index.page.js')))
    ```

## Build Configuration

Build configuration contains configuration that will only be used during the
build or development process. You can use any standard node.js JavaScript here.

-   renderApplicationToString(history, site)

    Called for each page that is statically generated. Returns a string representing the content for that page.

    ```js
    export function renderApplicationToString({ site, history }) {
      const Application = require('./Application')

      return ReactDOMServer.renderToString(
        React.createElement(Application, {
          history: history,
          site: site,
        })
      )
    }
    ```

-   rules

    An array of Sitepack rules, each which includes a test, and an array of
    Sitepack or Webpack loaders. You can intermix the two -- the only
    difference is that Sitepack loaders receive a little extra Sitepack-related
    configuration, including the current environment and your site's root
    directory. Sitepack loaders are distinguished by their 'sitepack' prefix.

    ```js
    export const loaders = [
      { test: /\.page\.js$/,
        use: [
          'sitepack-page',
          'babel'
        ]
      },
      { test: /\.js$/,
        exclude: /node_modules|\.example\.js|.\page\.js$/,
        use: 'babel'
      },
      { test: /\.css$/,
        use: 'sitepack-css',
      },
      { test: /\.(gif|jpe?g|png|ico)$/,
        use: {
          loader: 'url',
          options: { limit: 4000 },
        },
      },
      { test: /\.mdx?$/,
        use: {
          loader: 'sitepack-mdx',
          options: { es5: true },
        }
      },
      { test: /\.less$/,
        use: [
          'sitepack-css',
          'less'
        ],
      },
    ]
    ```

-   vendor

    An array of modules which should be placed in a separate bundle

    ```
    export const vendor = [ 'react', 'react-dom' ]
    ```

-   paths

    An object that allows you to specify the paths to various files, including:

    - `public`: A folder with static files that will be copied to your final build directory. Defaults to `CONFIG_PATH/public`.
    - `html`: The HTML template that will be wrapped around each generated page. Defaults to `CONFIG_PATH/index.html.ejs`
    - `loaders`: A directory where Sitepack will search for Webpack/Sitepack loaders. Defaults to `CONFIG_PATH/loaders`, if it exists.
    - `output`: The output directory for the application. Can be overriden using the CLI. Defaults to `CONFIG_PATH/build`.
