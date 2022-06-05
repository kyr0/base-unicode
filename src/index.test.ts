import { UnicodeAlphabet, encode, decodeToString, decodeToUint8Array } from './index'
import { AssemblyTestInput } from './__test__/data'
import { Buffer } from 'buffer'
import * as brotliPromise from 'brotli-wasm'

it('Encodes and decodes < 1 block size text', () => {
  const singleCharInput = '🤖'
  const encodedWithBlocks = encode(singleCharInput)
  const decodedWithBlocks = decodeToString(encodedWithBlocks)
  expect(singleCharInput).toStrictEqual(decodedWithBlocks)
})

it('Encodes and decodes exactly 1 block size text', () => {
  const oneBlockInput = 'Hello🤖!'
  const encodedWithBlocks = encode(oneBlockInput)
  const decodedWithBlocks = decodeToString(encodedWithBlocks)
  expect(decodedWithBlocks).toStrictEqual(oneBlockInput)
})

it('Can do exactly what the string usage example says in README', () => {
  const encodedBinary = encode('Hello, world!')
  const decodedBinary = decodeToString(encodedBinary)
  expect(encodedBinary).toStrictEqual('1劒碶翚禼誎藝矚h')
  expect(decodedBinary).toStrictEqual('Hello, world!')
})

it('Can do exactly what the binary usage example says in README', () => {
  const input = new Uint8Array([0xb, 0xa, 0xb, 0xe])
  const encodedBinary = encode(input)
  const decodedBinary = decodeToUint8Array(encodedBinary)
  expect(encodedBinary).toStrictEqual('0A坘存')
  expect(decodedBinary).toStrictEqual(input)
})

it('Encodes and decodes multi-block size text', () => {
  const encoded = encode(AssemblyTestInput)
  const decoded = decodeToString(encoded)
  expect(decoded).toStrictEqual(AssemblyTestInput)
})

it('Encodes and decodes a Uint8Array that consists of any valid 16bit number', () => {
  const input = new Uint8Array(65536)

  const inputData = []
  for (let i = 0; i < 65536; i++) {
    inputData.push(i)
  }
  input.set(inputData, 0)

  const encoded = encode(input)
  const decoded = decodeToUint8Array(encoded)
  expect(decoded).toStrictEqual(input)
})

it('Makes sure the alphabet is correctly sized', () => {
  expect(UnicodeAlphabet.length).toBe(21091)
})

it('Encodes and decodes its own UnicodeAlphabet', () => {
  const encoded = encode(UnicodeAlphabet)
  const decoded = decodeToString(encoded)
  expect(decoded).toStrictEqual(UnicodeAlphabet)
})

it('Compresses a text as binary then encodes and decodes it', async () => {
  console.log('Uncomressed input length', AssemblyTestInput.length)

  const brotli = await brotliPromise

  console.time('Compression took')

  const compressedData = brotli.compress(Buffer.from(AssemblyTestInput))

  console.timeEnd('Compression took')

  console.log('Compressed bytes length', compressedData.buffer.byteLength)

  console.time('Encoding took')
  const encoded = encode(compressedData)
  console.timeEnd('Encoding took')

  console.log('Compressed + encoded chars length', encoded.length)
  console.log('Compressed + encoded text', encoded)

  encoded
    .split('')
    .map((c) => c.charCodeAt(0).toString(2).padStart(16, '0'))
    .join(' ')

  console.time('Decoding took')
  const decoded = decodeToUint8Array(encoded)
  console.timeEnd('Decoding took')

  expect(decoded).toStrictEqual(compressedData)

  const decompressedData = Buffer.from(brotli.decompress(compressedData)).toString()
  expect(decompressedData).toStrictEqual(AssemblyTestInput)
})
