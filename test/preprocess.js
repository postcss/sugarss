import preprocess from '../preprocess';

import Input from 'postcss/lib/input';
import test  from 'ava';

function run(t, lines, result) {
    t.same(preprocess(new Input(''), lines), result);
}

let defaults = {
    number:    1,
    indent:    '',
    colon:     false,
    atrule:    false,
    comment:   false,
    lastComma: false
};

test('cleans from empty lines', t => {
    run(t, [[], [['space', '  '], ['newline', '\n']]], []);
});

test('separates indent from other tokens', t => {
    run(t, [[['space', '  '], ['word', 'ab']]], [
        {
            ...defaults,
            indent: '  ',
            tokens: [['word', 'ab']]
        }
    ]);
});

test('works with indentless strings', t => {
    run(t, [[['word', 'ab']]], [
        {
            ...defaults,
            indent: '',
            tokens: [['word', 'ab']]
        }
    ]);
});

test('collects line number', t => {
    run(t, [
        [['word', 'a'], ['newline', '\n', 1]],
        [['word', 'b'], ['newline', '\n', 2]]
    ], [
        {
            ...defaults,
            number: 1,
            tokens: [['word', 'a'], ['newline', '\n', 1]]
        }, {
            ...defaults,
            number: 2,
            tokens: [['word', 'b'], ['newline', '\n', 2]]
        }
    ]);
});

test('detects at-rules', t => {
    run(t, [[['at-word', '@ab'], ['space', ' ']]], [
        {
            ...defaults,
            tokens: [['at-word', '@ab'], ['space', ' ']],
            atrule: true
        }
    ]);
});

test('detects last comma', t => {
    run(t, [[['word', 'ab'], [',', ','], ['newline', '\n']]], [
        {
            ...defaults,
            tokens:    [['word', 'ab'], [',', ','], ['newline', '\n']],
            lastComma: true
        }
    ]);
});

test('detects last comma with trailing spaces', t => {
    run(t, [[['word', 'ab'], [',', ','], ['space', ' ']]], [
        {
            ...defaults,
            tokens:    [['word', 'ab'], [',', ','], ['space', ' ']],
            lastComma: true
        }
    ]);
});

test('detects last comma with trailing comment', t => {
    run(t, [[['word', 'ab'], [',', ','], ['comment', '// a']]], [
        {
            ...defaults,
            tokens:    [['word', 'ab'], [',', ','], ['comment', '// a']],
            lastComma: true
        }
    ]);
});

test('ignore comma inside', t => {
    run(t, [[['word', 'ab'], [',', ','], ['word', 'ba']]], [
        {
            ...defaults,
            tokens:    [['word', 'ab'], [',', ','], ['word', 'ba']],
            lastComma: false
        }
    ]);
});

test('detects colon', t => {
    run(t, [[['word', 'ab'], [':', ':'], ['word', 'ba']]], [
        {
            ...defaults,
            tokens: [['word', 'ab'], [':', ':'], ['word', 'ba']],
            colon:  true
        }
    ]);
});

test('ignores colon inside brackets', t => {
    run(t, [[['(', '('], [':', ':'], [')', ')']]], [
        {
            ...defaults,
            tokens: [['(', '('], [':', ':'], [')', ')']],
            colon:  false
        }
    ]);
});


test('detects comments', t => {
    run(t, [[['comment', '// a']]], [
        {
            ...defaults,
            tokens:  [['comment', '// a']],
            comment: true
        }
    ]);
});

test('detects mixed tabs and spaces in indent', t => {
    t.throws( () => {
        preprocess(new Input(''), [[['space', '\t '], ['word', 'ab']]]);
    }, '<css input>:1:2: Mixed tabs and spaces are not allowed');
});

test('detects mixed tabs and spaces in indents', t => {
    t.throws( () => {
        preprocess(new Input(''), [
            [['space', ' '],  ['newline', '\n', 1]],
            [['space', '\t'], ['word', 'ab']]
        ]);
    }, '<css input>:2:1: Mixed tabs and spaces are not allowed');
});

test('shows correct error position', t => {
    t.throws( () => {
        preprocess(new Input(''), [
            [['comment', '/*\n*/'],            ['newline', '\n', 2]],
            [['space', '\t'],  ['word', 'ab'], ['newline', '\n', 3]],
            [['space', '\t '], ['word', 'ab'], ['newline', '\n', 4]]
        ]);
    }, '<css input>:4:2: Mixed tabs and spaces are not allowed');
});
