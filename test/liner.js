import liner from '../liner';

import test from 'ava';

test('packs tokens by lines', t => {
    let tokens = [['word', 'a'], ['newline', '\n'], ['word', 'b']];
    t.same(liner(tokens), [
        [['word', 'a'], ['newline', '\n']],
        [['word', 'b']]
    ]);
});
