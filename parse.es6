import Input from 'postcss/lib/input';

import tokenizer from './tokenize';
import Parser    from './parser';
import lines     from './lines';

export default function parse(source, opts) {
    let input = new Input(source, opts);

    let parser = new Parser(input);
    parser.tokens = tokenizer(input);
    parser.lines  = lines(parser.tokens);
    parser.loop();

    return parser.root;
}
