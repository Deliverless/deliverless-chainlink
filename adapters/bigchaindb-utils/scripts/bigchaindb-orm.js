const models = require('../models/index.js')
const bigchaindbOrm = require('../modules/bigchaindb-orm/dist/node/index.js')
const Orm = bigchaindbOrm.default

class BigchainDB {
  constructor (host, debug = false) {
    this.bdbOrm = new Orm(`${host}:9984/api/v1/`)
    this.debug = debug
  }

  /**
   * Create a new object in the database
   * @date 2022-09-14
   * @param { * } model - The model to use
   * @param { * } data - The data to store for object
   * @param { * } keypair - The keypair to use for the object
   * @param { * } debug - Whether to print debug messages (optional)
   */
  async createObject (model, data, keypair, debug = this.debug) {
    if (!this.bdbOrm.models[model]) { await this.bdbOrm.define(model, models[model]) }
    if (model && data && keypair) {
      return await this.bdbOrm.models[model].create({
        keypair: keypair,
        data: data
      }).then((asset) => {
        if (debug) console.log(asset)
        return { id: String(asset.id), ...asset._schema, ...asset.data }
      })
    } else {
      console.log('The following args are missing: ' % (model, data, keypair))
    }
  }

  /**
   * Get all objects of a given model OR get the specific object with the given id
   * @date 2022-09-14
   * @param { * } model - The model to use
   * @param { * } assetId - The id of the object to get (optional)
   * @param { * } debug - Whether to print debug messages (optional)
   */
  async getObjectsById (model, assetId, debug = this.debug) {
    if (!this.bdbOrm.models[model]) { this.bdbOrm.define(model, models[model]) }
    // get all objects with retrieve()
    // or get a specific object with retrieve(object.id)
    const resObjects = await this.bdbOrm.models[model].retrieve(assetId).then((assets) => {
      if (debug) console.log('assets:', assets)
      return assets
    })
    if (assetId) return { id: String(resObjects[0].id), ...resObjects[0]._schema, ...resObjects[0].data }
    else return resObjects.map((asset) => { return { id: String(asset.id), ...asset._schema, ...asset.data } })
  }

  /**
   * Get objects by metadata
   * @date 2022-09-14
   * @param { * } model - The model to use
   * @param { * } metadata - The metadata to search for
   * @param { * } debug - Whether to print debug messages (optional)
   */
  async getObjectsByMetadata (model, metadata, limit = 1, debug = this.debug) {
    if (!this.bdbOrm.models[model]) { this.bdbOrm.define(model, models[model]) }
    const metadataValue = Object.keys(metadata)[0]
    if (debug) console.log('metadataValue:', metadataValue)
    const allObjects = await this.bdbOrm.models[model].retrieve()
    if (debug) console.log('Object count:', allObjects.length)
    const resObjects = await Promise.all(allObjects.map(async (asset, index) => {
      if (debug) console.log('iteration:', index, 'asset:', asset.data[metadataValue])
      if (asset.data[metadataValue] === metadata[metadataValue]) {
        return asset
      }
    }))
    const filteredObjects = resObjects.filter((asset) => { return asset !== undefined })
    if (debug) console.log('filteredObjects:', filteredObjects)
    if (limit === 1) {
      return filteredObjects.map((asset) => { return { id: String(asset.id), ...asset._schema, ...asset.data } })[0]
    } else if (limit > 1) {
      return filteredObjects.map((asset) => { return { id: String(asset.id), ...asset._schema, ...asset.data } }).slice(0, limit)
    } else if (limit === 0) {
      return filteredObjects.map((asset) => { return { id: String(asset.id), ...asset._schema, ...asset.data } })
    }
  }

  /**
   * Append data to an object
   * @date 2022-09-14
   * @param { * } model - The model to use
   * @param { * } assetId - The id of the object to append to
   * @param { * } data - The data to append
   * @param { * } keypair - The keypair to use for the object
   * @param { * } debug - Whether to print debug messages (optional)
   */
  async appendToObject (model, assetId, data, keypair, debug = this.debug) {
    if (!this.bdbOrm.models[model]) { this.bdbOrm.define(model, models[model]) }
    if (model && assetId && data && keypair) {
      // get the asset
      const resObject = await this.bdbOrm.models[model].retrieve(assetId).then((assets) => {
        // append to the asset
        if (debug) console.log('assets:', assets)
        if (assets.length > 0) {
          if (debug) console.log('asset retrieved:', assets[0])
          assets[0].append({
            toPublicKey: keypair.publicKey,
            keypair: keypair,
            data: data
          })
          return assets[0]
        } else {
          if (debug) console.log('No asset found with id:', assetId)
        }
      })
      return { id: String(resObject.id), ...resObject._schema, ...Object.assign({}, resObject.data, data) }
    } else {
      console.log('The following args are missing: ' % (model, assetId, data, keypair))
    }
  };

  /**
   * Burn an object
   * @date 2022-09-14
   * @param { * } model - The model to use
   * @param { * } assetId - The id of the object to burn
   * @param { * } keypair - The keypair to use for the object
   * @param { * } debug - Whether to print debug messages (optional)
   */
  async burnObject (model, assetId, keypair, debug = this.debug) {
    if (!this.bdbOrm.models[model]) { this.bdbOrm.define(model, models[model]) }
    if (model && assetId && keypair) {
      // create an asset with Alice as owner
      const resObject = await this.bdbOrm.models[model].retrieve(assetId).then((assets) => {
        // lets burn the asset by assigning to a random keypair
        // since will not store the private key it's infeasible to redeem the asset
        return assets[0].burn({ keypair: keypair })
      }).then((burnedAsset) => {
        if (debug) console.log(burnedAsset.data)
        return { id: String(assetId), ...burnedAsset.data }
      })
      return resObject
    } else { console.log('The following args are missing: ' % (model, assetId, keypair)) }
  };
}

module.exports = BigchainDB
