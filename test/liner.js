import liner from '../liner';

import test from 'ava';

test('packs tokens by lines', t => {
    let tokens = [['word', 'a'], ['newline', '\n'], ['word', 'b']];
    t.deepEqual(liner(tokens), [
        [['word', 'a'], ['newline', '\n']],
        [['word', 'b']]
    ]);
});

test('ignores newline inside brackets', t => {
    let tokens = [['(', '('], ['newline', '\n'], [')', ')']];
    t.deepEqual(liner(tokens), [
        [['(', '('], ['newline', '\n'], [')', ')']]
    ]);
});
