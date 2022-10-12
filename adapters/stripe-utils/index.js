const { getSecret } = require('./scripts/stripe.js')
const { Requester, Validator } = require('@chainlink/external-adapter')

const createRequest = async (input, callback) => {
  const validator = new Validator(callback, input)
  const jobRunID = validator.validated.id
  let response = 'Invalid method'

  try {
    if (input.total) {
      getSecret(input.total).then((res) => {
        response = res
      })
    }
    callback(200, Requester.success(jobRunID, { data: Object.assign({ result: 'success' }, response), status: 200 }))
  } catch (error) {
    callback(500, Requester.errored(jobRunID, 'Something went wrong: ' + error))
  }
}

module.exports.createRequest = createRequest
