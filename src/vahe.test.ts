import { encode, decodeToString, alphabet } from './vahe'
import { AssemblyTestInput } from './__test__/data'
import { Buffer } from 'buffer'
import * as brotliPromise from 'brotli-wasm'

it('Encodes and decodes < 1 block size text, latin1 chars only', () => {
  const singleCharInput = 'my-data-testv'
  const encodedWithBlocks = encode(singleCharInput)
  const decodedWithBlocks = decodeToString(encodedWithBlocks)
  expect(singleCharInput).toStrictEqual(decodedWithBlocks)
})

/*
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

it('Encodes and decodes multi-block size text', () => {
  const encoded = encode(AssemblyTestInput)
  const decoded = decodeToString(encoded)
  expect(decoded).toStrictEqual(AssemblyTestInput)
})

it('Encodes and decodes a Uint8Array that consists of any valid 16bit number', () => {
  const input = new Uint8Array(65536)

  const inputData = []
  for (let i = 0; i < 65536; i++) {
    inputData.push(String.fromCharCode(i))
  }
  input.set(inputData, 0)

  const encoded = encode(input.join(''))
  const decoded = decodeToString(encoded)
  expect(decoded).toStrictEqual(input.join(''))
})

it('Makes sure the alphabet is correctly sized', () => {
  expect(alphabet.length).toBe(21091)
})

it('Encodes and decodes its own UnicodeAlphabet', () => {
  const encoded = encode(alphabet)
  const decoded = decodeToString(encoded)
  expect(decoded).toStrictEqual(alphabet)
})

it('Compresses a text as binary then encodes and decodes it', async () => {
  console.log('Uncomressed input length', AssemblyTestInput.length)

  const brotli = await brotliPromise

  console.time('Compression took')

  const compressedData = brotli.compress(Buffer.from(AssemblyTestInput))

  console.timeEnd('Compression took')

  const compressedDataTextBase64 = Buffer.from(compressedData).toString('base64')

  console.log('Compressed bytes length', compressedData.buffer.byteLength)

  console.time('Encoding took')
  const encoded = encode(compressedDataTextBase64)
  console.timeEnd('Encoding took')

  console.log('Compressed + encoded chars length', encoded.length)
  console.log('Compressed + encoded text', encoded)

  encoded
    .split('')
    .map((c) => c.charCodeAt(0).toString(2).padStart(16, '0'))
    .join(' ')

  console.time('Decoding took')
  const decodedBase64 = decodeToString(encoded)
  console.timeEnd('Decoding took')

  const decompressedData = Buffer.from(brotli.decompress(Buffer.from(decodedBase64, 'base64'))).toString()
  expect(decompressedData).toStrictEqual(AssemblyTestInput)
})

*/
