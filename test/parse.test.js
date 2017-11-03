const jsonify = require('postcss-parser-tests').jsonify;
const path    = require('path');
const fs      = require('fs');

const parse = require('../parse');

it('detects indent', () => {
    let root = parse('@one\n  @two\n    @three');
    expect(root.raws.indent).toEqual('  ');
});

it('throws on first indent', () => {
    expect(() => {
        parse('  @charset "UTF-8"');
    }).toThrowError('<css input>:1:1: First line should not have indent');
});

it('throws on too big indent', () => {
    expect(() => {
        parse('@supports\n  @media\n      // test');
    }).toThrowError('<css input>:3:1: Expected 4 indent, but get 6');
});

it('throws on wrong indent step', () => {
    expect(() => {
        parse('@supports\n  @media\n @media');
    }).toThrowError('<css input>:3:1: Expected 0 or 2 indent, but get 1');
});

it('throws on decl without property', () => {
    expect(() => {
        parse(': black');
    }).toThrowError('<css input>:1:1: Declaration without name');
});

it('throws on space between property', () => {
    expect(() => {
        parse('one two: black');
    }).toThrowError('<css input>:1:5: Unexpected separator in property');
});

it('throws on semicolon in declaration', () => {
    expect(() => {
        parse('a\n  color: black;');
    }).toThrowError('<css input>:2:15: Unnecessary semicolon');
});

it('throws on semicolon in at-rule', () => {
    expect(() => {
        parse('@charset "UTF-8";');
    }).toThrowError('<css input>:1:17: Unnecessary semicolon');
});

it('throws on curly in rule', () => {
    expect(() => {
        parse('a {\n  color: black');
    }).toThrowError('<css input>:1:3: Unnecessary curly bracket');
});

it('throws on curly in at-rule', () => {
    expect(() => {
        parse('@media (screen) {\n  color: black');
    }).toThrowError('<css input>:1:17: Unnecessary curly bracket');
});

it('keeps trailing spaces', () => {
    let root = parse('@media  s \n  a\n  b \n    a : \n      b \n//  a \n \n');
    expect(root.raws.after).toEqual('\n \n');
    expect(root.first.raws.sssBetween).toEqual(' ');
    expect(root.first.raws.afterName).toEqual('  ');
    expect(root.first.first.raws.sssBetween).toEqual(' ');
    expect(root.first.first.first.raws.between).toEqual(' : \n      ');
    expect(root.first.first.first.raws.value.raw).toEqual('b ');
    expect(root.last.raws.left).toEqual('  ');
    expect(root.last.raws.inlineRight).toEqual(' ');
});

it('supports files without last new line', () => {
    expect(parse('color: black').raws.after).toEqual('');
});

it('keeps last new line', () => {
    expect(parse('color: black\n').raws.after).toEqual('\n');
});

it('generates correct source maps on trailing spaces', () => {
    expect(parse('a: 1 ').first.source.end.line).toEqual(1);
});

it('sets end position for root', () => {
    expect(parse('a\n  b: 1\n').source.end).toEqual({ line: 2, column: 6 });
});

let tests = fs
    .readdirSync(path.join(__dirname, 'cases'))
    .filter(i => path.extname(i) === '.sss' );

function read(file) {
    return fs.readFileSync(path.join(__dirname, 'cases', file)).toString();
}

for ( let name of tests ) {
    it('parses ' + name, () => {
        let sss    = read(name);
        let css    = read(name.replace(/\.sss/, '.css'));
        let json   = read(name.replace(/\.sss/, '.json'));
        let root   = parse(sss, { from: name });
        let result = root.toResult({
            map: {
                inline:     false,
                annotation: false
            }
        });
        expect(result.css).toEqual(css);
        expect(jsonify(root)).toEqual(json.trim());
    });
}
