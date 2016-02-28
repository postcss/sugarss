import Comment from 'postcss/lib/comment';
import Root    from 'postcss/lib/root';

export default class Parser {

    constructor(input) {
        this.input = input;

        this.pos     = 0;
        this.root    = new Root();
        this.current = this.root;
        this.spaces  = '';
        this.indent  = false;

        this.root.source = { input, start: { line: 1, column: 1 } };
    }

    loop() {
        let line;
        while ( this.pos < this.lines.length ) {
            line = this.lines[this.pos];

            if ( !this.indent && line.indent.length && !line.comment ) {
                this.indent = line.indent;
                this.root.raws.indent = this.indent;
            }

            if ( line.comment ) {
                this.comment(line);
            } else if ( line.atrule ) {
                this.atrule(line);
            }

            this.pos += 1;
        }
    }

    comment(line) {
        let token = line.tokens[0];
        let node  = new Comment();
        this.init(node, token[2], token[3]);
        node.source.end = { line: token[4], column: token[5] };

        let text = token[1];
        if ( token[6] === 'inline' ) {
            text = text.slice(2);
        } else {
            text = text.slice(2, -2);
        }

        if ( /^\s*$/.test(text) ) {
            node.text       = '';
            node.raws.left  = text;
            node.raws.right = '';
        } else {
            let match = text.match(/^(\s*)([^]*[^\s])(\s*)$/);
            node.text       = match[2];
            node.raws.left  = match[1];
            node.raws.right = match[3];
        }
    }

    atrule() {
    }

    init(node, line, column) {
        this.current.push(node);
        node.source = { start: { line, column }, input: this.input };
    }

}
