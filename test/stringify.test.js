let { readdirSync, readFileSync } = require('fs')
let { join, extname } = require('path')

let stringify = require('../stringify')
let parse = require('../parse')

let tests = readdirSync(join(__dirname, 'cases')).filter(
  i => extname(i) === '.sss'
)

function read (file) {
  return readFileSync(join(__dirname, 'cases', file)).toString()
}

function run (sss) {
  let root = parse(sss)
  let output = ''
  stringify(root, i => {
    output += i
  })
  expect(sss).toEqual(output)
}

it('saves newlines', () => {
  run('a\r\n  color: black')
})

for (let name of tests) {
  it('stringifies ' + name, () => {
    run(read(name))
  })
}
