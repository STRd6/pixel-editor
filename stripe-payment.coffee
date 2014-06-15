q = []

push = (selector) ->
  q.push selector

$.getScript('https://checkout.stripe.com/checkout.js')
.done ->
  console.log "loaded"
  q.forEach process
  push = process

process = (selector) ->
  handler = StripeCheckout.configure
    key: 'pk_znR9dUa0sPXSlVv2009vpWdtexnnq'
    image: 'https://fbcdn-photos-h-a.akamaihd.net/hphotos-ak-xap1/t39.2081-0/851574_391517107646989_794757491_n.png'
    token: (token, args) ->
      # TODO: Post to server!
      console.log token, args

  document.querySelector(selector).addEventListener 'click', (e) ->

    handler.open
      name: 'Pixi Paint'
      description: 'Pixi Paint ($1.99)'
      amount: 199
  
    e.preventDefault()

module.exports = (selector) ->
  push selector
