'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const <%- moduleVarName %> = require('..')

describe('<%- moduleName %>', function() {
  it('should say hello', function(done) {
    expect(<%- moduleVarName %>()).to.equal('Hello, world')
    done()
  })
})
