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
const MAX_SAFE_INT_16_BIT = SIZE_INT_16BIT - 1

function* alphabet(size = SIZE_INT_16BIT, onlyPrintables = true, uriSafe = true) {
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
  [...alphabet(size, onlyPrintables, uriSafe)].join('')

// pre-generate standard Unicode alphabet (URI safe, printable, 21078 symbols)
export const UnicodeAlphabet: string = makeAlphabet()

// amount of values that cannot be represented in a single symbol
// this is basically the UTF-16/UCS-2 maximum representable number
// minus the number of symbols that can be represented in a single symbol
// because they are indexed in the algorithmically created alphabet
const OutOfBoundNumberDifference = MAX_SAFE_INT_16_BIT - UnicodeAlphabet.length

// calculates the ratio between the number of usable numbers and those who are
// out of bounds because there is no symbol available in the alphabet (alphabet too small
// to represent the symbol). This ratio value is used as the divisor to get the
// mathematically safe minimum number of iterations to encode a symbol.
// A Unicode alphabet should never be smaller than a third of
const SafeRatioDivisor = Math.floor(MAX_SAFE_INT_16_BIT / UnicodeAlphabet.length)

if (SafeRatioDivisor > 3) {
  throw new Error('The Unicode alphabet is too small to represent all possible symbols')
}

// the base offset number to add/subtract when encoding/decoding symbols
// that doesn't fit into a single symbol
const OUT_OF_RANGE_OFFSET_BASE = Math.round(OutOfBoundNumberDifference / SafeRatioDivisor)

// calculates how many symbols can be correctly "addressed" with
// calcuation meta-data per block. The meta-data is the number of "add"
// arithmethic operations have to be performed to come up with the
// correct original value per symbol.

// therefore the bit depth is calculated via Math.log2(UnicodeAlphabet.length)
// and floored (rounded to lower nearest integer; cuts away decimal part)
// for example: If the alphabet has 21078 symbols, the bit depth is 14 bits maximum
// However, the number of iterations to come up with the correct value can be up to 3.
// Because of that, we need 2 bits to address each symbol.
// This means, we need to divide by 2 to get the number of maximum characters
// per block that could be addressed with meta-information without ending up
// with a symbol that is out of bounds (of the alphabet).
// example: 14 bit -> 7 symbols per block; if none of the following
// symbols need to be added up: 0b0000000000000000
// if the last of 7 symbols needs to be added up 2 times: 0b0000 0000 0000 0010
// if the first of 7 symbols needs to be added up 3 times: 0b0011 0000 0000 0000
const BlockSize = Math.floor(Math.log2(UnicodeAlphabet.length)) / 2

// up to 3 bits can be set
const FLAG_IS_ODD = 0b1
const FLAG_IS_EVEN = 0b0

export const encode = (input: string | Uint8Array): string => {
  if (typeof input === 'string') {
    const nativeBuffer = Buffer.from(input)
    const arrayBuffer = nativeBuffer.buffer.slice(
      nativeBuffer.byteOffset,
      nativeBuffer.byteOffset + nativeBuffer.byteLength,
    )
    input = new Uint8Array(arrayBuffer)
  }

  const dataView = new DataView(input.buffer)
  const encoded = []

  let block = 0
  let blockMetaData = ''

  // in case of odd input length,
  // the actual length of the Uint8Array must be postfixed
  // in order to be able to truncate the output when decoding
  if (input.byteLength & 1) {
    encoded.push(FLAG_IS_ODD)
  } else {
    encoded.push(FLAG_IS_EVEN)
  }

  const ceiledLength = Math.ceil(input.byteLength)
  const unceiledByteLength = input.byteLength
  const byteLength = ceiledLength & 1 ? ceiledLength + 1 : ceiledLength
  const doubeByteLength = byteLength / Uint16Array.BYTES_PER_ELEMENT
  const isDoubleByteLengthLesserEqualBlockSize = doubeByteLength <= BlockSize

  let blockMetadataWriteOffset = 0
  let blockCounter = 0

  for (let iByte = 0; iByte < byteLength; iByte += Uint16Array.BYTES_PER_ELEMENT) {
    blockCounter++
    const iDoubleByte = iByte / Uint16Array.BYTES_PER_ELEMENT
    const isBlockStartIndex = iByte === 0 || blockCounter === BlockSize
    const isLastIteration = iDoubleByte === doubeByteLength - 1
    const isFirstIteration = iDoubleByte === 0
    const isEndOfABlockIteration = isBlockStartIndex && iDoubleByte >= 0
    const is8BitOddLeftOverValue = unceiledByteLength - iByte === 1

    if (iByte === 0) {
      encoded.push('0'.charCodeAt(0))
      blockMetadataWriteOffset++
    }

    // character from alphabet, first iteration; naive approach
    // in case dataView.byteLength - i equals to 1,
    // the input Uint8Array length is odd and the
    // last value is a single byte (in perspective of Uint16)
    const value = is8BitOddLeftOverValue ? dataView.getUint8(iByte) : dataView.getUint16(iByte, isLittleEndian)

    // multi-byte encoding. all multibyte encodings remove
    // 0123456789 from the alphabet to make sure that the
    // encoding special characters are not ambiguous
    if (typeof UnicodeAlphabet[value] == 'undefined') {
      let j = 1 // iteration index, encoded as iteration marker

      // for as long as we cannot find a character in the alphabet,
      // divide by 2
      while (true) {
        const indexCandidate = value - OUT_OF_RANGE_OFFSET_BASE * j

        if (typeof UnicodeAlphabet[indexCandidate] != 'undefined') {
          encoded.push(UnicodeAlphabet.charAt(indexCandidate))

          // add the count of subtraction arithmethic operations necessary
          // to limit the number to fit into the alphabet to the right
          // place in the bitfield (addressed to the symbol in the block)
          blockMetaData = j.toString(2).padStart(2, '0') + blockMetaData
          break
        }
        ++j

        if (j === 9) {
          throw new Error('Encoder failed to encode the input value after 9 attempts: ' + value)
        }
      }
    } else {
      // naive, single byte encoding
      encoded.push(UnicodeAlphabet.charAt(value))

      // mark the index of that block to be a single symbol case
      blockMetaData = '00' + blockMetaData
    }

    if (isEndOfABlockIteration || isLastIteration) {
      // calculate access index for the previous blocks bitfield
      const lastBlockBitfieldReservedIndex = block * BlockSize - BlockSize
      const blockMetaDataUint16 = parseInt(blockMetaData, 2)
      const metaDataIndex = lastBlockBitfieldReservedIndex + blockMetadataWriteOffset
      const isValidMetaDataSection = !Number.isNaN(blockMetaDataUint16) && metaDataIndex >= 1

      if (isValidMetaDataSection) {
        encoded[lastBlockBitfieldReservedIndex + blockMetadataWriteOffset] = UnicodeAlphabet.charAt(blockMetaDataUint16)
        blockCounter = 0
      }

      if (isValidMetaDataSection && !isLastIteration && !isFirstIteration) {
        blockMetaData = '' // reset block meta data

        if (!isDoubleByteLengthLesserEqualBlockSize) {
          // reserve space for next block bitfield
          encoded.push('0'.charCodeAt(0))
          blockMetadataWriteOffset++
        }
      }
      block++
    }
  }
  return encoded.join('')
}

export const decodeToUint8Array = (input: string): Uint8Array => {
  if (!input || !input.length) return new Uint8Array()

  const decoded: Array<number> = []
  const decoded8bit: Array<number> = []
  const isOfOddByteLength = !!(input.charCodeAt(0) & FLAG_IS_ODD)

  const blockMetaData: Array<number> = []
  let blockMetadataWriteOffset = 0

  // length -1 because we're starting with a padding of 1
  for (let iDoubleByte = 1; iDoubleByte < input.length - 1; iDoubleByte++) {
    // because we're starting at 1, we need to correct by 1 for arithmethic ops
    const iArithmeticDoubleByteIndex = iDoubleByte - 1
    const isBlockStartIndex = iArithmeticDoubleByteIndex % BlockSize === 0

    if (isBlockStartIndex) {
      const char = input[iDoubleByte + blockMetadataWriteOffset]

      // end condition for block start but there is no metadata (length out of bounds)
      if (typeof char === 'undefined') {
        break
      }
      const metaDataForBlock = UnicodeAlphabet.indexOf(char)
      const binaryStringFlags = metaDataForBlock.toString(2).padStart(16, '0')
      const blockMetaDataSplit = binaryStringFlags
        .match(/.{1,2}/g)
        .map((n) => parseInt(n, 2))
        .reverse()

      blockMetadataWriteOffset++

      const metaDataIndexPadding = iDoubleByte + blockMetadataWriteOffset

      for (let i = 0; i < BlockSize; i++) {
        blockMetaData[metaDataIndexPadding + i] = blockMetaDataSplit[i]
      }
    }
    const dataReadIndex = iDoubleByte + blockMetadataWriteOffset

    if (typeof input[dataReadIndex] === 'undefined') {
      break
    }

    const encodedValue = input.charAt(dataReadIndex)
    const isLastCharacter = iDoubleByte + 1 >= input.length - blockMetadataWriteOffset

    const value = UnicodeAlphabet.indexOf(encodedValue) + OUT_OF_RANGE_OFFSET_BASE * blockMetaData[dataReadIndex]
    const low = value & 0xff
    const high = value >> 8

    if (isOfOddByteLength && isLastCharacter) {
      decoded8bit.push(low)
      break
    } else {
      decoded8bit.push(low)
      decoded8bit.push(high)
    }
    decoded.push(value)
  }
  return new Uint8Array(decoded8bit)
}

export const decodeToString = (input: string): string => Buffer.from(decodeToUint8Array(input)).toString()
