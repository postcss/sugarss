import tokenize from '../tokenize';

import Input from 'postcss/lib/input';
import test  from 'ava';

function run(t, css, tokens) {
    t.same(tokenize(new Input(css)), tokens);
}

test('tokenizes inine comments', t => {
    run(t, '// a', [ ['comment', '// a', 1, 1, 1, 4, 'inline'] ]);
});

test('tokenizes inine comments and new lines', t => {
    run(t, '// a\n', [ ['comment', '// a', 1, 1, 1, 4, 'inline'],
                       ['newline', '\n'] ]);
});

test('tokenizes Windows new lines', t => {
    run(t, '\r\n', [ ['newline', '\r\n'] ]);
});

test('tokenizes single carriage return', t => {
    run(t, '\ra', [ ['space', '\r'], ['word', 'a', 1, 2, 1, 2] ]);
});

test('tokenizes last carriage return', t => {
    run(t, '\r', [ ['space', '\r'] ]);
});

test('throws a error on tab symbol', t => {
    t.throws( () => {
        run(t, '\t', []);
    }, '<css input>:1:1: In SugarSS you must replace tab indents to spaces');
});
