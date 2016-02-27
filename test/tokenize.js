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
    run(t, '\ra', [ ['newline', '\r'], ['word', 'a', 2, 1, 2, 1] ]);
});

test('tokenizes last carriage return', t => {
    run(t, '\r', [ ['newline', '\r'] ]);
});

test('tokenizes last carriage return', t => {
    run(t, '\f', [ ['newline', '\f'] ]);
});

test('tokenizes comma', t => {
    run(t, 'a,b', [ ['word', 'a', 1, 1, 1, 1],
                    [',',    ',', 1, 2],
                    ['word', 'b', 1, 3, 1, 3] ]);
});

test('escapes control symbols', t => {
    run(t, '\\(\\{\\"\\@\\\\""', [
        ['word',   '\\(',  1,  1, 1,  2],
        ['word',   '\\{',  1,  3, 1,  4],
        ['word',   '\\"',  1,  5, 1,  6],
        ['word',   '\\@',  1,  7, 1,  8],
        ['word',   '\\\\', 1,  9, 1, 10],
        ['string', '""',   1, 11, 1, 12]
    ]);
});

test('escapes new line', t => {
    run(t, '\\\n\\\r\\\r\n\\\f\\\\\n', [
        ['word',    '\\\n',   1,  1, 1,  2],
        ['word',    '\\\r',   1,  3, 1,  4],
        ['word',    '\\\r\n', 1,  5, 1,  7],
        ['word',    '\\\f',   1,  8, 1,  9],
        ['word',    '\\\\',   1, 10, 1, 11],
        ['newline', '\n']
    ]);
});
