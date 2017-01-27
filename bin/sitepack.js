#!/usr/bin/env node

require('babel-register');

var packageJSON = require('../package.json')
var program = require('commander')
var path = require('path')
var fs = require('fs')
var assign = require('object-assign')


var packageRoot = fs.realpathSync(process.cwd());

var defaultHost = process.platform === 'win32'
  ? 'localhost'
  : '0.0.0.0'


function getConfig(command) {
  const configPath = path.resolve(packageRoot, command.config)

  return assign({}, command, {
    packageRoot: packageRoot,
    siteRoot: path.dirname(configPath),
    sitepackConfig: require(configPath),
  })
}

var siteDirectory = fs.realpathSync(process.cwd());


program
  .version(packageJSON.version)
  .usage('[command] [options]')

program.command('start')
  .description('Start development server. Watches files and rebuilds and hot reloads if something changes') // eslint-disable-line max-len
  .option('-H, --host <url>',
          `Set host. Defaults to ${defaultHost}`,
          defaultHost
         )
  .option('-p, --port <port>', 'Set port. Defaults to 4000', '4000')
  .option('-c, --config [file]', 'The path to the sitepack.config.js file.', 'sitepack.config.js')
  .action(function (command) {
    var start = require('../lib/scripts/start').default
    start(getConfig(command))
  })

program.command('build')
  .description('Build a Sitepack project.')
  .option('-c, --config [file]', 'The path to the sitepack.config.js file.', 'sitepack.config.js')
  .option('-o, --output [directory]', 'The directory to write the output to.', 'site/build')
  .action(function (command) {
    process.env.NODE_ENV = 'production'

    var build = require('../lib/scripts/build').default
    build(getConfig(command), function (err) {
      if (err) {
        throw err
      } else {
        console.log('Done')
      }
    })
  })

program.command('view')
  .description('View built site.')
  .option('-H, --host <url>',
          `Set host. Defaults to ${defaultHost}`,
          defaultHost
         )
  .option('-p, --port <port>', 'Set port. Defaults to 4000', '4000')
  .option('-d, --directory [directory]', 'The path to the sitepack.config.js file.', 'site/build')
  .action(function (command) {
    var serve = require('../lib/scripts/view').default
    serve(command)
  })

program.on('--help', function() {
  console.log(`To show subcommand help:
    sitepack [command] -h
  `)
})


program.parse(process.argv)
