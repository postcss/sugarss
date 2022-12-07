let { equal } = require('uvu/assert')
let { test } = require('uvu')

let liner = require('../liner')

test('packs tokens by lines', () => {
  let tokens = [
    ['word', 'a'],
    ['newline', '\n'],
    ['word', 'b']
  ]
  equal(liner(tokens), [
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
  equal(liner(tokens), [
    [
      ['(', '('],
      ['newline', '\n'],
      [')', ')']
    ]
  ])
})

test.run()
