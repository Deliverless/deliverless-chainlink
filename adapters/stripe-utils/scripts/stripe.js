const stripe = require('stripe')('sk_test_51LiTBOHlhPKJMrfBnCyVBdvKHPFoO6dQIQ88KiNZpNauIYMr9a7x10rLUgOrzJ3w3SqInYruHKQoB0WbRqU9smf0000wjTos2s');

const getSecret = async (total) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: total,
    currency: 'cad',
    automatic_payment_methods: {
      enabled: true
    }
  })

  return paymentIntent.client_secret
}

module.exports = {
  getSecret
}
