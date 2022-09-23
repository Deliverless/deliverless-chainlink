const BigchainDB = require('./scripts/bigchaindb-orm.js')
const bip39 = require('bip39')
const { Requester, Validator } = require('./modules/@chainlink/external-adapter')

const createRequest = async (input, callback) => {
  const bigchaindb = new BigchainDB('http://24.150.93.243', false)
  // DO NOT CHANGE THIS
  const seed = bip39.mnemonicToSeedSync('candy maple cake sugar pudding cream honey rich smooth crumble sweet treat').slice(0, 32)
  const keypair = new bigchaindb.bdbOrm.driver.Ed25519Keypair(seed)
  // The Validator helps you validate the Chainlink request data
  const validator = new Validator(callback, input)
  const jobRunID = validator.validated.id
  let response = 'Invalid method'

  try {
    if (input.data.method && input.data.model) {
      const meta = JSON.parse(Buffer.from(input.data.meta, 'base64').toString())
      console.log('meta resolved:', meta)
      if (input.data.method === 'add') {
        response = await bigchaindb.createObject(input.data.model, meta, keypair)
      } else if (input.data.method === 'find') {
        response = await bigchaindb.getObjectsByMetadata(input.data.model, meta, input.data.limit)
      } else if (input.data.method === 'get') {
        response = await bigchaindb.getObjectsById(input.data.model, input.data.id)
      } else if (input.data.method === 'update') {
        response = await bigchaindb.appendToObject(input.data.model, input.data.id, meta, keypair)
      } else if (input.data.method === 'delete') {
        response = await bigchaindb.burnObject(input.data.model, input.data.id, keypair)
      } else {
        callback(200, Requester.success(jobRunID, { data: response, result: response ? 'success' : 'empty', status: 200 }))
      }
    }
    callback(200, Requester.success(jobRunID, { data: response, result: response ? 'success' : 'empty', status: 200 }))
  } catch (error) {
    callback(500, Requester.errored(jobRunID, 'Something went wrong: ' + error))
  }
}

// This allows the function to be exported for testing
// or for running in express
module.exports.createRequest = createRequest
