let { equal } = require('node:assert')
let { readdirSync, readFileSync } = require('node:fs')
let { extname, join } = require('node:path')
let { test } = require('node:test')

let parse = require('../parse')
let stringify = require('../stringify')

let tests = readdirSync(join(__dirname, 'cases')).filter(
  i => extname(i) === '.sss'
)

function read(file) {
  return readFileSync(join(__dirname, 'cases', file)).toString()
}

function run(sss) {
  let root = parse(sss)
  let output = ''
  stringify(root, i => {
    output += i
  })
  equal(sss, output)
}

test('saves newlines', () => {
  run('a\r\n  color: black')
})

for (let name of tests) {
  test('stringifies ' + name, () => {
    run(read(name))
  })
}
