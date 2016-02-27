import preprocess from '../preprocess';

import Input from 'postcss/lib/input';
import test  from 'ava';

function run(t, lines, result) {
    t.same(preprocess(new Input(''), lines), result);
}

test('separates indent from other tokens', t => {
    run(t, [[['space', '  '], ['word', 'ab']]], [
        {
            indent:    '  ',
            tokens:    [['word', 'ab']],
            colon:     false,
            atrule:    false,
            lastComma: false
        }
    ]);
});

test('works with indentless strings', t => {
    run(t, [[['word', 'ab']]], [
        {
            indent:    '',
            tokens:    [['word', 'ab']],
            colon:     false,
            atrule:    false,
            lastComma: false
        }
    ]);
});

test('detects at-rules', t => {
    run(t, [[['at-word', '@ab'], ['space', ' ']]], [
        {
            indent:    '',
            tokens:    [['at-word', '@ab'], ['space', ' ']],
            colon:     false,
            atrule:    true,
            lastComma: false
        }
    ]);
});

test('detects last comma', t => {
    run(t, [[['word', 'ab'], [',', ',']]], [
        {
            indent:    '',
            tokens:    [['word', 'ab'], [',', ',']],
            colon:     false,
            atrule:    false,
            lastComma: true
        }
    ]);
});

test('detects last comma with trailing spaces', t => {
    run(t, [[['word', 'ab'], [',', ','], ['space', ' ']]], [
        {
            indent:    '',
            tokens:    [['word', 'ab'], [',', ','], ['space', ' ']],
            colon:     false,
            atrule:    false,
            lastComma: true
        }
    ]);
});

test('ignore comma inside', t => {
    run(t, [[['word', 'ab'], [',', ','], ['word', 'ba']]], [
        {
            indent:    '',
            tokens:    [['word', 'ab'], [',', ','], ['word', 'ba']],
            colon:     false,
            atrule:    false,
            lastComma: false
        }
    ]);
});

test('detects colon', t => {
    run(t, [[['word', 'ab'], [':', ':'], ['word', 'ba']]], [
        {
            indent:    '',
            tokens:    [['word', 'ab'], [':', ':'], ['word', 'ba']],
            colon:     true,
            atrule:    false,
            lastComma: false
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
            [['space', ' '],  ['newline', '\n']],
            [['space', '\t'], ['word', 'ab']]
        ]);
    }, '<css input>:2:1: Mixed tabs and spaces are not allowed');
});
