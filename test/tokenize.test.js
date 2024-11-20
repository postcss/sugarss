let { deepStrictEqual } = require('node:assert')
let { test } = require('node:test')
let { Input } = require('postcss')

let tokenize = require('../tokenize')

function run(css, expectedTokens) {
  let tokens = tokenize(new Input(css))
  deepStrictEqual(tokens, expectedTokens)
}

test('tokenizes inline comments', () => {
  run('// a', [['comment', '// a', 0, 4, 'inline']])
})

test('tokenizes inline comments and new lines', () => {
  run('// a\r\n', [
    ['comment', '// a', 0, 4, 'inline'],
    ['newline', '\r\n', 4, 6]
  ])
})

test('tokenizes new lines around spaces', () => {
  run(' \n ', [
    ['space', ' ', 0, 1],
    ['newline', '\n', 1, 2],
    ['space', ' ', 2, 3]
  ])
})

test('tokenizes Windows new lines', () => {
  run('\r\n', [['newline', '\r\n', 0, 2]])
})

test('tokenizes single carriage return', () => {
  run('\ra', [
    ['newline', '\r', 0, 1],
    ['word', 'a', 1, 2]
  ])
})

test('tokenizes last carriage return', () => {
  run('\r', [['newline', '\r', 0, 1]])
})

test('tokenizes comma', () => {
  run('a,b', [
    ['word', 'a', 0, 1],
    [',', ',', 1, 2],
    ['word', 'b', 2, 3]
  ])
})

test('escapes control symbols', () => {
  run('\\(\\{\\"\\@\\\\""', [
    ['word', '\\(', 0, 2],
    ['word', '\\{', 2, 4],
    ['word', '\\"', 4, 6],
    ['word', '\\@', 6, 8],
    ['word', '\\\\', 8, 10],
    ['string', '""', 10, 12]
  ])
})

test('escapes new line', () => {
  run('\\\n\\\r\\\r\n\\\f\\\\\n', [
    ['word', '\\\n', 0, 2],
    ['word', '\\\r', 2, 4],
    ['word', '\\\r\n', 4, 7],
    ['word', '\\\f', 7, 9],
    ['word', '\\\\', 9, 11],
    ['newline', '\n', 11, 12]
  ])
})

test('tokenizes close curly brace', () => {
  run('a { color: black; }', [
    ['word', 'a', 0, 1],
    ['space', ' ', 1, 2],
    ['{', '{', 2, 3],
    ['space', ' ', 3, 4],
    ['word', 'color', 4, 9],
    [':', ':', 9, 10],
    ['space', ' ', 10, 11],
    ['word', 'black', 11, 16],
    [';', ';', 16, 17],
    ['space', ' ', 17, 18],
    ['}', '}', 18, 19]
  ])
})

test.run()
