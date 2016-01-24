'use strict'
const util = require('util')
const path = require('path')
const yeoman = require('yeoman-generator')
const wiring = require('html-wiring')
const camelCase = require('lodash.camelcase')
const slug = require('lodash.kebabcase')
const mkdirp = require('mkdirp').sync
const gitconfig = require('git-config')

module.exports = class NodejsGenerator extends yeoman.Base {

  constructor(args, options, config) {
    super(args, options, config)
    this.pkg = JSON.parse(wiring.readFileAsString(path.join(__dirname, '../package.json')))
  }

  install() {
    if (!this.options['skip-install']) {
      this.installDependencies({
        bower: false,
      })
    }
  }

  askFor() {
    let cb = this.async()

    let config = gitconfig.sync()

    let prompts = [
      {
        type: 'input',
        name: 'moduleName',
        message: 'node.js module name:',
        default: path.basename(process.cwd()),
      },
      {
        type: 'input',
        name: 'moduleDesc',
        message: 'Module description',
      },
      {
        type: 'input',
        name: 'keywords',
        message: 'Module keywords',
        filter:
          function(value) {
            if (typeof value === 'string') {
              value = value.split(',')
            }
            return value
              .map(function(val) {
                return val.trim()
              })
              .filter(function(val) {
                return val.length > 0
              })
          },
      },
    ]

    this.prompt(prompts, function(props) {
      this.moduleName = slug(props.moduleName)
      this.moduleVarName = camelCase(props.moduleName)
      this.moduleDesc = props.moduleDesc
      this.keywords = props.keywords
      this.githubName = 'zkochan'
      this.author = 'Zoltan Kochan'

      this.dequote = function(str) {
        return str.replace(/\"/gm, '\\"')
      }

      cb()
    }.bind(this))
  }

  build() {
    this.template('_package.json', 'package.json')

    this.copy('jshintrc', '.jshintrc')
    this.copy('jscsrc', '.jscsrc')
    this.copy('travis.yml', '.travis.yml')
    this.copy('gitignore', '.gitignore')
    this.copy('LICENSE', 'LICENSE')
    this.template('README.md', 'README.md')
  }

  testFrameworks() {
    mkdirp('test')
    this.copy('lib.js', 'index.js')
    this.template('test.js', 'test/index.js')
  }
}
