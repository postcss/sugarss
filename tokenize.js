const SINGLE_QUOTE = "'".charCodeAt(0)
const DOUBLE_QUOTE = '"'.charCodeAt(0)
const BACKSLASH = '\\'.charCodeAt(0)
const SLASH = '/'.charCodeAt(0)
const NEWLINE = '\n'.charCodeAt(0)
const SPACE = ' '.charCodeAt(0)
const FEED = '\f'.charCodeAt(0)
const TAB = '\t'.charCodeAt(0)
const CR = '\r'.charCodeAt(0)
const OPEN_PARENTHESES = '('.charCodeAt(0)
const CLOSE_PARENTHESES = ')'.charCodeAt(0)
const OPEN_CURLY = '{'.charCodeAt(0)
const CLOSE_CURLY = '}'.charCodeAt(0)
const SEMICOLON = ';'.charCodeAt(0)
const ASTERICK = '*'.charCodeAt(0)
const COLON = ':'.charCodeAt(0)
const AT = '@'.charCodeAt(0)
const COMMA = ','.charCodeAt(0)

const RE_AT_END = /[\t\n\f\r "'()/;\\{]/g
const RE_NEW_LINE = /[\n\f\r]/g
const RE_WORD_END = /[\t\n\f\r !"'(),:;@\\{}]|\/(?=\*)/g
const RE_BAD_BRACKET = /.[\n"'(/\\]/

module.exports = function tokenize(input) {
  let tokens = []
  let css = input.css.valueOf()

  let code, content, escape, escaped, escapePos, n, next, prev, quote

  let length = css.length
  let offset = 0
  let pos = 0

  function unclosed(what) {
    throw input.error('Unclosed ' + what, pos)
  }

  while (pos < length) {
    code = css.charCodeAt(pos)

    switch (code) {
      case CR:
        if (css.charCodeAt(pos + 1) === NEWLINE) {
          tokens.push(['newline', '\r\n', offset, offset + 2])
          offset += 2
          pos += 1
        } else {
          tokens.push(['newline', '\r', offset, offset + 1])
          offset++
        }
        break

      case NEWLINE:
      case FEED:
        tokens.push(['newline', css.slice(pos, pos + 1), offset, offset + 1])
        offset++
        break

      case SPACE:
      case TAB:
        next = pos
        do {
          next += 1
          code = css.charCodeAt(next)
        } while (code === SPACE || code === TAB)

        tokens.push([
          'space',
          css.slice(pos, next),
          offset,
          offset + (next - pos)
        ])
        offset += next - pos
        pos = next - 1
        break

      case OPEN_CURLY:
        tokens.push(['{', '{', offset, offset + 1])
        offset++
        break

      case CLOSE_CURLY:
        tokens.push(['}', '}', offset, offset + 1])
        offset++
        break

      case COLON:
        tokens.push([':', ':', offset, offset + 1])
        offset++
        break

      case SEMICOLON:
        tokens.push([';', ';', offset, offset + 1])
        offset++
        break

      case COMMA:
        tokens.push([',', ',', offset, offset + 1])
        offset++
        break

      case OPEN_PARENTHESES:
        prev = tokens.length ? tokens[tokens.length - 1][1] : ''
        n = css.charCodeAt(pos + 1)
        if (
          prev === 'url' &&
          n !== SINGLE_QUOTE &&
          n !== DOUBLE_QUOTE &&
          n !== SPACE &&
          n !== NEWLINE &&
          n !== TAB &&
          n !== FEED &&
          n !== CR
        ) {
          next = pos
          do {
            escaped = false
            next = css.indexOf(')', next + 1)
            if (next === -1) unclosed('bracket')
            escapePos = next
            while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
              escapePos -= 1
              escaped = !escaped
            }
          } while (escaped)

          tokens.push(['brackets', css.slice(pos, next + 1), offset, next + 1])
          offset = next + 1
          pos = next
        } else {
          next = css.indexOf(')', pos + 1)
          content = css.slice(pos, next + 1)

          if (next === -1 || RE_BAD_BRACKET.test(content)) {
            tokens.push(['(', '(', offset, offset + 1])
            offset++
          } else {
            tokens.push(['brackets', content, offset, next + 1])
            offset = next + 1
            pos = next
          }
        }
        break

      case CLOSE_PARENTHESES:
        tokens.push([')', ')', offset, offset + 1])
        offset++
        break

      case SINGLE_QUOTE:
      case DOUBLE_QUOTE:
        quote = code === SINGLE_QUOTE ? "'" : '"'
        next = pos
        do {
          escaped = false
          next = css.indexOf(quote, next + 1)
          if (next === -1) unclosed('quote')
          escapePos = next
          while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
            escapePos -= 1
            escaped = !escaped
          }
        } while (escaped)

        content = css.slice(pos, next + 1)

        tokens.push(['string', content, offset, offset + content.length])

        offset += content.length
        pos = next
        break

      case AT:
        RE_AT_END.lastIndex = pos + 1
        RE_AT_END.test(css)
        if (RE_AT_END.lastIndex === 0) {
          next = css.length - 1
        } else {
          next = RE_AT_END.lastIndex - 2
        }

        tokens.push([
          'at-word',
          css.slice(pos, next + 1),
          offset,
          offset + (next - pos + 1)
        ])

        offset += next - pos + 1
        pos = next
        break

      case BACKSLASH:
        next = pos
        escape = true

        while (css.charCodeAt(next + 1) === BACKSLASH) {
          next += 1
          escape = !escape
        }
        code = css.charCodeAt(next + 1)
        if (escape) {
          if (code === CR && css.charCodeAt(next + 2) === NEWLINE) {
            next += 2
          } else if (code === CR || code === NEWLINE || code === FEED) {
            next += 1
          } else {
            next += 1
          }
        }

        tokens.push([
          'word',
          css.slice(pos, next + 1),
          offset,
          offset + (next - pos + 1)
        ])

        offset += next - pos + 1
        pos = next
        break

      default:
        n = css.charCodeAt(pos + 1)

        if (code === SLASH && n === ASTERICK) {
          next = css.indexOf('*/', pos + 2) + 1
          if (next === 0) unclosed('comment')

          content = css.slice(pos, next + 1)

          tokens.push(['comment', content, offset, offset + content.length])

          offset += content.length
          pos = next
        } else if (code === SLASH && n === SLASH) {
          RE_NEW_LINE.lastIndex = pos + 1
          RE_NEW_LINE.test(css)
          if (RE_NEW_LINE.lastIndex === 0) {
            next = css.length - 1
          } else {
            next = RE_NEW_LINE.lastIndex - 2
          }

          content = css.slice(pos, next + 1)

          tokens.push([
            'comment',
            content,
            offset,
            offset + content.length,
            'inline'
          ])

          offset += content.length
          pos = next
        } else {
          RE_WORD_END.lastIndex = pos + 1
          RE_WORD_END.test(css)
          if (RE_WORD_END.lastIndex === 0) {
            next = css.length - 1
          } else {
            next = RE_WORD_END.lastIndex - 2
          }

          content = css.slice(pos, next + 1)

          tokens.push(['word', content, offset, offset + content.length])

          offset += content.length
          pos = next
        }

        break
    }

    pos++
  }

  return tokens
}
