const Input = require('postcss/lib/input');

const preprocess = require('../preprocess');

function run(lines, result) {
    expect(preprocess(new Input(''), lines)).toEqual(result);
}

let defaults = {
    number:    1,
    before:    '',
    indent:    '',
    colon:     false,
    atrule:    false,
    comment:   false,
    lastComma: false
};

let end = { before: '', end: true };

it('cleans from lines', () => {
    run([
        [['newline', '\n', 1]],
        [['space', ' '], ['newline', '\n', 2]],
        [['word', 'a'], ['newline', '\n', 3]],
        [['space', '  '], ['newline', '\n', 4]]
    ], [
        {
            ...defaults,
            number: 3,
            before: '\n \n',
            tokens: [['word', 'a']]
        },
        {
            ...end,
            before: '\n  \n'
        }
    ]);
});

it('separates indent = require(other tokens', () => {
    run([[['space', '  '], ['word', 'ab']]], [
        {
            ...defaults,
            indent: '  ',
            tokens: [['word', 'ab']]
        },
        end
    ]);
});

it('works with indentless strings', () => {
    run([[['word', 'ab']]], [
        {
            ...defaults,
            indent: '',
            tokens: [['word', 'ab']]
        },
        end
    ]);
});

it('collects line number', () => {
    run([
        [['word', 'a'], ['newline', '\n', 1]],
        [['word', 'b'], ['newline', '\n', 2]]
    ], [
        {
            ...defaults,
            number: 1,
            tokens: [['word', 'a']]
        }, {
            ...defaults,
            number: 2,
            tokens: [['word', 'b']],
            before: '\n'
        }, {
            ...end,
            before: '\n'
        }
    ]);
});

it('detects at-rules', () => {
    run([[['at-word', '@ab'], ['space', ' ']]], [
        {
            ...defaults,
            tokens: [['at-word', '@ab'], ['space', ' ']],
            atrule: true
        },
        end
    ]);
});

it('detects last comma', () => {
    run([[['word', 'ab'], [',', ','], ['newline', '\n']]], [
        {
            ...defaults,
            tokens:    [['word', 'ab'], [',', ',']],
            lastComma: true
        }, {
            ...end,
            before: '\n'
        }
    ]);
});

it('detects last comma with trailing spaces', () => {
    run([[['word', 'ab'], [',', ','], ['space', ' ']]], [
        {
            ...defaults,
            tokens:    [['word', 'ab'], [',', ','], ['space', ' ']],
            lastComma: true
        },
        end
    ]);
});

it('detects last comma with trailing comment', () => {
    run([[['word', 'ab'], [',', ','], ['comment', '// a']]], [
        {
            ...defaults,
            tokens:    [['word', 'ab'], [',', ','], ['comment', '// a']],
            lastComma: true
        },
        end
    ]);
});

it('ignore comma inside', () => {
    run([[['word', 'ab'], [',', ','], ['word', 'ba']]], [
        {
            ...defaults,
            tokens:    [['word', 'ab'], [',', ','], ['word', 'ba']],
            lastComma: false
        },
        end
    ]);
});

it('detects colon with space', () => {
    run([[['word', 'ab'], [':', ':'], ['space', ' ']]], [
        {
            ...defaults,
            tokens: [['word', 'ab'], [':', ':'], ['space', ' ']],
            colon:  true
        },
        end
    ]);
});

it('detects colon with newline', () => {
    run([[['word', 'ab'], [':', ':'], ['newline', '\n']]], [
        {
            ...defaults,
            tokens: [['word', 'ab'], [':', ':']],
            colon:  true
        },
        {
            ...end,
            before: '\n'
        }
    ]);
});

it('ignores colon without space', () => {
    run([[['word', 'ab'], [':', ':'], ['word', 'ba']]], [
        {
            ...defaults,
            tokens: [['word', 'ab'], [':', ':'], ['word', 'ba']],
            colon:  false
        },
        end
    ]);
});

it('ignores colon inside brackets', () => {
    run([[['(', '('], [':', ':'], ['space', ' '], [')', ')']]], [
        {
            ...defaults,
            tokens: [['(', '('], [':', ':'], ['space', ' '], [')', ')']],
            colon:  false
        },
        end
    ]);
});

it('closes brackets', () => {
    run([[['(', '('], [')', ')'], [':', ':'], ['space', ' ']]], [
        {
            ...defaults,
            tokens: [['(', '('], [')', ')'], [':', ':'], ['space', ' ']],
            colon:  true
        },
        end
    ]);
});

it('detects comments', () => {
    run([[['comment', '// a']]], [
        {
            ...defaults,
            tokens:  [['comment', '// a']],
            comment: true
        },
        end
    ]);
});

it('detects mixed tabs and spaces in indent', () => {
    expect( () => {
        preprocess(new Input(''), [[['space', '\t '], ['word', 'ab']]]);
    }).toThrowError('<css input>:1:2: Mixed tabs and spaces are not allowed');
});

it('detects mixed tabs and spaces in indents', () => {
    expect( () => {
        preprocess(new Input(''), [
            [['space', ' '],  ['newline', '\n', 1]],
            [['space', '\t'], ['word', 'ab']]
        ]);
    }).toThrowError('<css input>:2:1: Mixed tabs and spaces are not allowed');
});

it('shows correct error position', () => {
    expect( () => {
        preprocess(new Input(''), [
            [['comment', '/*\n*/'],            ['newline', '\n', 2]],
            [['space', '\t'],  ['word', 'ab'], ['newline', '\n', 3]],
            [['space', '\t '], ['word', 'ab'], ['newline', '\n', 4]]
        ]);
    }).toThrowError('<css input>:4:2: Mixed tabs and spaces are not allowed');
});
