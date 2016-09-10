define [], () ->
  check = (args...) ->
    for a,i in args
      if not a?
        console.error "Function called with insufficient arguments!
          The #{ i }-th argument is '#{ typeof a }'"

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
