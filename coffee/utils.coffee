define [], () ->
  check = (args...) ->
    for a in args
      if not a?
        console.error "Function called with insufficient arguments!"
        throw Error "ArgumentError"


  tmpl = (source, destination, args...) ->
    check source, args

    r = String::format.call $(source).html(), args...

    if destination?
      $(destination).append r

    return r


  utils =
    check: check
    tmpl: tmpl

  return utils
