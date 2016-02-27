import Input from 'postcss/lib/input';

import preprocess from './preprocess';
import tokenizer  from './tokenize';
import Parser     from './parser';
import liner      from './liner';

export default function parse(source, opts) {
    let input = new Input(source, opts);

    let parser = new Parser(input);
    parser.lines = preprocess(input, liner(tokenizer(input)));
    parser.loop();

    return parser.root;
}
