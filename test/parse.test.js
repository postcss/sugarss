let { deepStrictEqual, equal, throws } = require('node:assert')
let { readdirSync, readFileSync } = require('node:fs')
let { extname, join } = require('node:path')
let { test } = require('node:test')
let { jsonify } = require('postcss-parser-tests')

let parse = require('../parse')

test('detects indent', () => {
  let root = parse('@one\n  @two\n    @three')
  equal(root.raws.indent, '  ')
})

test('throws on first indent', () => {
  throws(() => {
    parse('  @charset "UTF-8"')
  }, /<css input>:1:1: First line should not have indent/)
})

test('throws on too big indent', () => {
  throws(() => {
    parse('@supports\n  @media\n      // test')
  }, /<css input>:3:1: Expected 4 indent, but get 6/)
})

test('throws on wrong indent step', () => {
  throws(() => {
    parse('@supports\n  @media\n @media')
  }, /<css input>:3:1: Expected 0 or 2 indent, but get 1/)
})

test('throws on decl without property', () => {
  throws(() => {
    parse(': black')
  }, /<css input>:1:1: Declaration without name/)
})

test('throws on space between property', () => {
  throws(() => {
    parse('one two: black')
  }, /<css input>:1:5: Unexpected separator in property/)
})

test('throws on semicolon in declaration', () => {
  throws(() => {
    parse('a\n  color: black;')
  }, /<css input>:2:15: Unnecessary semicolon/)
})

test('throws on semicolon in at-rule', () => {
  throws(() => {
    parse('@charset "UTF-8";')
  }, /<css input>:1:17: Unnecessary semicolon/)
})

test('throws on curly in rule', () => {
  throws(() => {
    parse('a {\n  color: black')
  }, /<css input>:1:3: Unnecessary curly bracket/)
})

test('throws on curly in at-rule', () => {
  throws(() => {
    parse('@media (screen) {\n  color: black')
  }, /<css input>:1:17: Unnecessary curly bracket/)
})

test('keeps trailing spaces', () => {
  let root = parse('@media  s \n  a\n  b \n    a : \n      b \n//  a \n \n')
  equal(root.raws.after, '\n \n')
  equal(root.first.raws.sssBetween, ' ')
  equal(root.first.raws.afterName, '  ')
  equal(root.first.first.raws.sssBetween, ' ')
  equal(root.first.first.first.raws.between, ' : \n      ')
  equal(root.first.first.first.raws.value.raw, 'b ')
  equal(root.last.raws.left, '  ')
  equal(root.last.raws.inlineRight, ' ')
})

test('supports files without last new line', () => {
  equal(parse('color: black').raws.after, '')
})

test('keeps last new line', () => {
  equal(parse('color: black\n').raws.after, '\n')
})

test('generates correct source maps on trailing spaces', () => {
  equal(parse('a: 1 ').first.source.end.line, 1)
})

test('sets end position for root', () => {
  deepStrictEqual(parse('a\n  b: 1\n').source.end, { column: 6, line: 2 })
})

let tests = readdirSync(join(__dirname, 'cases')).filter(
  i => extname(i) === '.sss'
)

function read(file) {
  return readFileSync(join(__dirname, 'cases', file)).toString()
}

for (let name of tests) {
  test('parses ' + name, () => {
    let sss = read(name)
    let css = read(name.replace(/\.sss/, '.css'))
    let json = read(name.replace(/\.sss/, '.json'))
    let root = parse(sss, { from: name })
    let result = root.toResult({
      map: {
        annotation: false,
        inline: false
      }
    })
    equal(result.css, css)
    deepStrictEqual(jsonify(root), JSON.parse(json.trim()))
  })
}
