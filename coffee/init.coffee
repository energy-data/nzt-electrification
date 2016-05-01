requirejs.config
  'baseUrl': './javascripts'
  # 'paths':
  #   'd3':         "../lib/d3/d3.min"
  #   'rivets':     "../lib/rivets/dist/rivets.bundled.min"
  #   'bootstrap':  "../lib/bootstrap/dist/js/bootstrap.min"
  #   'js-extras':  "../lib/js-extras/dist/js-extras.min"
  #   'web-extras': "../lib/web-extras/dist/web-extras.min"

require [
  'global'
  # 'd3'
  # 'rivets'
  # 'bootstrap'
  # 'js-extras'
  # 'web-extras'
],

(_g) ->
  # window._g = _g

  if _g.alive
    console.warn "yay! seems like everything is working! now delete me!"
