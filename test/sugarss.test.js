let { test } = require('uvu')
let { equal } = require('uvu/assert')

let sugarss = require('../')

test('has parse()', () => {
  equal(typeof sugarss.parse, 'function')
})

test('has stringify()', () => {
  equal(typeof sugarss.stringify, 'function')
})

test.run()
