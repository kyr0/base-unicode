// useful relevant documentation (context)
// https://mathiasbynens.be/notes/javascript-unicode#astral-ranges
// http://www.unicode.org/charts/
// https://en.wikipedia.org/wiki/CJK_Unified_Ideographs#Font_support
import { Buffer } from 'buffer'

// Unicode match mode is important here
export const IsUnicodeNonPrintableTest =
  /[\u0000-\u0008\u1c80-\u1c86\u000B-\u001F\u007F-\u009F\u2000-\u200F\u2028-\u202F\u205F-\u206F\u3000\uFEFF\u{E0100}-\u{E01EF}]/u

// Unicode match mode is important here
export const IsNotUriSafe = /[&$\+,:;~"`'=\?@#\s<>/\[\]\{\}|\\\^%]/u

// digits are not part of the alphabet, so they don't collide
export const IsSimpleDigit = /[0-9]/

export const CharacterClassRanges = [
  // latin
  'a-z',
  // greek
  'α-ω',
  // cyrillic
  'а-я',
  // CJK Unified Ideographs
  '一-龯',
]

// match case insensitive, in Unicode mode
const IsPrintableUnicode = new RegExp(`^[${CharacterClassRanges.join('')}]*$`, 'iu')

export const isLittleEndian = new Uint8Array(new Uint32Array([0x11223344]).buffer)[0] === 0x44

const SIZE_INT_16BIT = 2 ** 16

function* yieldAlphabet(size = SIZE_INT_16BIT, onlyPrintables = true, uriSafe = true) {
  // walk Unicode Plane 0, Basic Multilingual Plane (BMP)
  // @see: https://en.wikipedia.org/wiki/Plane_(Unicode)
  // hex range: 0xFEFF0000 to 0xFEFFFFFF
  for (let i = 0; i < size; i++) {
    // UCS-2 encode
    const value = String.fromCodePoint(...[i])
    if (
      onlyPrintables &&
      IsPrintableUnicode.test(value) &&
      !IsUnicodeNonPrintableTest.test(value) &&
      uriSafe &&
      !IsNotUriSafe.test(value) &&
      i < size
    ) {
      yield value
    }
  }
}

export const makeAlphabet = (size = SIZE_INT_16BIT, onlyPrintables = true, uriSafe = true): string =>
  [...yieldAlphabet(size, onlyPrintables, uriSafe)].join('')

// pre-generate standard Unicode alphabet (URI safe, printable, 21078 symbols)
export const alphabet: string = makeAlphabet()

const blockSize = 6
const encodedBlockSize = Math.ceil(Math.log(256 ** blockSize) / Math.log(alphabet.length))

export const encode = (data: string): string => {
  let result = ''
  for (let i = 0; i < data.length; i += blockSize) {
    let n = 0
    for (let j = i; j < i + blockSize && j < data.length; j++) {
      n = n * 256 + data.charCodeAt(j)
    }
    while (n) {
      const v = n % alphabet.length
      n = (n - v) / alphabet.length
      result += alphabet[v]
    }
  }
  return result
}

export const decodeToString = (data: string): string => {
  let result = ''
  for (let i = 0; i < data.length; i += encodedBlockSize) {
    let n = 0
    const encodedBlock = data.slice(i, i + encodedBlockSize)
    for (let j = encodedBlock.length - 1; j >= 0; j--) {
      n = n * alphabet.length + alphabet.indexOf(encodedBlock[j])
    }
    let block = ''
    while (n) {
      const v = n % 256
      n = (n - v) / 256
      block = String.fromCharCode(v) + block
    }
    result += block
  }
  return result
}
