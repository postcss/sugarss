let { equal } = require('node:assert')
let { test } = require('node:test')

let sugarss = require('../')

test('has parse()', () => {
  equal(typeof sugarss.parse, 'function')
})

test('has stringify()', () => {
  equal(typeof sugarss.stringify, 'function')
})
