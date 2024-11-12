let { Input } = require('postcss')

let liner = require('./liner')
let Parser = require('./parser')
let preprocess = require('./preprocess')
let tokenizer = require('./tokenize')

module.exports = function parse(source, opts) {
  let input = new Input(source, opts)

  let parser = new Parser(input)
  parser.tokens = tokenizer(input)
  parser.parts = preprocess(input, liner(parser.tokens))
  parser.loop()

  return parser.root
}
