function indentError(input, l, p) {
    throw input.error('Mixed tabs and spaces are not allowed', l, p + 1);
}

export default function preprocess(input, lines) {
    let indentType;
    let prevNumber = 0;
    return lines.map(line => {
        let lastComma = false;
        let comment   = false;
        let number    = prevNumber + 1;
        let atrule    = false;
        let indent    = '';
        let tokens    = [];
        let colon     = false;

        if ( line.length > 0 ) {
            if ( line[0][0] === 'space' ) {
                indent = line[0][1];
                tokens = line.slice(1);
            } else {
                indent = '';
                tokens = line;
            }

            if ( !indentType && indent.length ) {
                indentType = indent[0] === ' ' ? 'space' : 'tab';
            }
            if ( indentType === 'space' ) {
                if ( indent.indexOf('\t') !== -1 ) {
                    indentError(input, number, indent.indexOf('\t'));
                }
            } else if ( indentType === 'tab' ) {
                if ( indent.indexOf(' ') !== -1 ) {
                    indentError(input, number, indent.indexOf(' '));
                }
            }

            if ( tokens.length ) {
                for ( let i = tokens.length - 1; i >= 0; i-- )  {
                    if ( tokens[i][0] === ',' ) {
                        lastComma = true;
                        break;
                    } else if ( tokens[i][0] !== 'space' ) {
                        break;
                    }
                }
                comment = tokens[0][0] === 'comment';
                atrule  = tokens[0][0] === 'at-word';
                colon   = tokens.some( j => j[0] === ':' );
            }

            let last = tokens[tokens.length - 1];
            if ( last && last[0] === 'newline' ) prevNumber = last[2];
        }

        return { number, indent, tokens, atrule, colon, comment, lastComma };
    });
}
