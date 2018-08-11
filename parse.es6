import Input from 'postcss/lib/input'

import preprocess from './preprocess'
import tokenizer from './tokenize'
import Parser from './parser'
import liner from './liner'

export default function parse (source, opts) {
  let input = new Input(source, opts)

  let parser = new Parser(input)
  parser.tokens = tokenizer(input)
  parser.parts = preprocess(input, liner(parser.tokens))
  parser.loop()

  return parser.root
}
