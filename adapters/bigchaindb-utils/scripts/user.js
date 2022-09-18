const bip39 = require('bip39')
const BigchainDb = require('./bigchaindb-orm.js')

const bigchaindb = new BigchainDb('http://24.150.93.243', true)

// DO NOT CHANGE THIS
const seed = bip39.mnemonicToSeedSync('candy maple cake sugar pudding cream honey rich smooth crumble sweet treat').slice(0, 32)
const keypair = new bigchaindb.bdbOrm.driver.Ed25519Keypair(seed)

// *** ONLY replace data within args for createUser function  ***

/**
 * Create a new user object in the database
 * @date 2022-09-14
 */
const createUser = async () => {
  await bigchaindb.createObject('user', { firstName: 'Marcin', lastName: 'Koziel', encoded: 'marcinkoziel123' }, keypair, true)
}

/**
 * Get all users in the database (top 10 seemingly - unless specified unqique id, then expect one result)
 * @date 2022-09-14
 */
const getUsers = async () => {
  await bigchaindb.getObjectsById('user', 'id:global:user:b468ea12-fb29-4fae-ac1f-4d2bf9b061a8', true)
}

/**
 * Search for users by metadata
 * @date 2022-09-14
 */
const searchUsersByMetadata = async () => {
  await bigchaindb.getObjectsByMetadata('user', { endcode: '0x655610ba313a5fbcf80e87a9388194f7a1c3093c3e2d8cfba07c47085a083475' })
}

/**
 * Append data to a user object
 * @date 2022-09-14
 */
const appendUserData = async () => {
  await bigchaindb.appendToObject('user', 'id:global:user:72db7335-5fc8-4697-ba11-283415aaf26f', { firstName: 'Koziel', lastName: 'Marcin' }, keypair, true)
}

/**
 * Burn a user object
 * @date 2022-09-14
 */
const burnUser = async () => {
  await bigchaindb.burnObject('user', 'id:global:user:72db7335-5fc8-4697-ba11-283415aaf26f', keypair, true)
}

const print = async () => {
  await getUsers().then((res) => {
    console.log('res:', res)
  })
}

print()

exports.createUser = createUser
exports.getUsers = getUsers
exports.searchUsersByMetadata = searchUsersByMetadata
exports.appendUserData = appendUserData
exports.burnUser = burnUser
