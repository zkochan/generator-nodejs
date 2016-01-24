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
      {
        type: 'confirm',
        name: 'useGrunt',
        message: 'Use grunt?',
        default: true,
      },
      {
        type: 'list',
        name: 'testFramework',
        message: 'Testing framework',
        choices: ['mocha', 'tape', 'redtape'],
        default: 'mocha',
      },
      {
        type: 'list',
        name: 'assertionLibrary',
        message: 'Assertion Library',
        choices: ['expect.js', 'chai', 'none'],
        default: 'expect.js',
      },
      {
        type: 'input',
        name: 'githubName',
        message: 'Your github username',
        default: (config.github && config.github.user) || '',
      },
      {
        type: 'input',
        name: 'author',
        message: 'Author name',
        default:
          ((config.user && config.user.name) || '') +
          (' <' + ((config.user && config.user.email) || '') + '>'),
      },
    ]

    this.prompt(prompts, function(props) {
      this.moduleName = slug(props.moduleName)
      this.moduleVarName = camelCase(props.moduleName)
      this.moduleDesc = props.moduleDesc
      this.keywords = props.keywords
      this.githubName = props.githubName
      this.author = props.author
      this.copyrightName = props.author.replace(/<[^>]*?>/gm, '').trim()
      this.testFramework = props.testFramework
      this.assertionLibrary = props.assertionLibrary
      this.useGrunt = props.useGrunt

      this.dequote = function(str) {
        return str.replace(/\"/gm, '\\"')
      }

      cb()
    }.bind(this))
  }

  build() {
    this.template('_package.json', 'package.json')

    if (this.useGrunt) {
      this.template('Gruntfile.js', 'Gruntfile.js')
      this.copy('jshintrc', '.jshintrc')
    }
    this.copy('travis.yml', '.travis.yml')
    this.copy('gitignore', '.gitignore')
    this.copy('LICENSE', 'LICENSE')
    this.template('README.md', 'README.md')
  }

  testFrameworks() {
    mkdirp('test')
    mkdirp('test/fixtures')
    this.copy('lib.js', 'index.js')

    switch (this.testFramework) {
      case 'mocha':
        this.template('test.js', 'test/index.js')
        break

      case 'tape':
        this.template('test-tape.js', 'test/index.js')
        break

      case 'redtape':
        this.template('test-redtape.js', 'test/index.js')
        break

      default:
        break
    }
  }
}
