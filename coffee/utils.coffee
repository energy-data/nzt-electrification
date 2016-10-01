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


  dwnld = (string, filename, datatype) ->
    a = document.createElement 'a'
    document.body.appendChild a

    a.style = "display:none;"

    blob = new Blob [string], type: (datatype || 'application/octet-stream')
    url  = URL.createObjectURL blob

    a.href     = url
    a.download = filename || "RENAME_ME.dat"
    a.click()

    window.URL.revokeObjectURL url


  percent = (x, y, p) ->
    return ((x / y) * 100).toFixed(p || 2) + "%";


  utils =
    check: check
    tmpl: tmpl
    dwnld: dwnld
    percent: percent

  return utils
