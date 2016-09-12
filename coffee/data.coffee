define ['_g'], (_g) ->
  binder = ->
    return new Proxy {}, {
      get: (target, property) -> target[property]

      set: (target, property, value, receiver) ->
        if (property is 'callback') and (typeof value is 'object')
          if not target['callbacks']?
            target['callbacks'] = {}

          target['callbacks'][value[0]] = value[1]

        else
          target[property] = value

          div = document.querySelectorAll("[data='#{ property }']")[0]

          if div? then div.innerText = (if value? then value else null)

        if target['callbacks']? and target['callbacks'][property]?
          target['callbacks'][property].apply null, arguments

        return true
    }

  data = {}

  for o in _g.bound_objects
    data[o] = binder()

  window.data = data

  return data
