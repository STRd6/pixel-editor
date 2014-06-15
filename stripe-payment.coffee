q = []

push = (selector) ->
  q.push selector

$.getScript('https://checkout.stripe.com/checkout.js')
.done ->
  console.log "loaded"
  q.forEach process
  push = process

description = 'Pixi Paint ($1.99)'
amount = 199

process = (selector) ->
  handler = StripeCheckout.configure
    key: 'pk_PPCRZgLrovwFHSKmMkjtVONHDs3pR'
    image: 'https://fbcdn-photos-h-a.akamaihd.net/hphotos-ak-xap1/t39.2081-0/851574_391517107646989_794757491_n.png'
    token: (token, args) ->
      $.post "http://pixi-paint-payments.herokuapp.com/charge",
        amount: amount
        description: description
        stripeEmail: token.email
        stripeToken: token.id

  document.querySelector(selector).addEventListener 'click', (e) ->

    handler.open
      name: 'Pixi Paint'
      description: description
      amount: amount
  
    e.preventDefault()

module.exports = (selector) ->
  push selector
