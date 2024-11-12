let { deepStrictEqual } = require('node:assert')
let { test } = require('node:test')

let liner = require('../liner')

test('packs tokens by lines', () => {
  let tokens = [
    ['word', 'a'],
    ['newline', '\n'],
    ['word', 'b']
  ]
  deepStrictEqual(liner(tokens), [
    [
      ['word', 'a'],
      ['newline', '\n']
    ],
    [['word', 'b']]
  ])
})

test('ignores newline inside brackets', () => {
  let tokens = [
    ['(', '('],
    ['newline', '\n'],
    [')', ')']
  ]
  deepStrictEqual(liner(tokens), [
    [
      ['(', '('],
      ['newline', '\n'],
      [')', ')']
    ]
  ])
})
