export default function lines(tokens) {
    let line = [];
    let result = [line];
    for ( let token of tokens ) {
        line.push(token);
        if ( token[0] === 'newline' ) {
            line = [];
            result.push(line);
        }
    }
    return result;
}
