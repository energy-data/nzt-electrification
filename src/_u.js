define([], () => {
  var network_error = () => {
    document.getElementById('error').innerHTML = "There seems to be a <strong>network problem</strong>. Check your connection and refresh the tool, please.";

    throw Error("Network error.");
  };

  var get_query_param = (param) => {
    let p = param.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");

    let regex = new RegExp("[\\?&]" + p + "=([^&#]*)");

    let results = regex.exec(location.search);

    return (results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " ")));
  };

  var set_query_param = (key,value) => {
    let uri = location.search;

    let re  = new RegExp("([?&])" + key + "=.*?(&|$)", 'i');

    let separator = (uri.indexOf('?') !== -1 ? "&" : "?");

    if (uri.match(re)) {
      if (value === null)
        return uri.replace(re, '$2');

      else
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    }

    else
      return uri + (value ? `${ separator }${ key }=${ value }` : "");
  };

  var l_scale = (v, domain = [0, 100], range = [0, 1]) => {
    return v < domain[1] ?
      ((v / domain[1]) * (range[1] - range[0])) + range[0] :
      range[1];
  };

  var check = (...args) => {
    args.map((a,i) => {
      if (a == null) {
        console.error(`Function called with insufficient arguments! The ${ i }-th argument is '${ typeof a }'`);
        throw Error("ArgumentError")
      };
    });
  };

  var tmpl = (source, destination, ...args) => {
    check(source, args);

    let r = String.prototype.format.call($(source).html(), ...args);

    if (destination) $(destination).append(r);

    return r;
  };

  var dwnld = (string, filename, datatype) => {
    let a = document.createElement('a');
    document.body.appendChild(a);

    a.style = "display:none;";

    let blob = new Blob([string], { type: (datatype || 'application/octet-stream') });
    let url  = URL.createObjectURL(blob);

    a.href     = url;
    a.download = filename || "RENAME_ME.dat";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  var percent = (x, y, p) => {
    return ((x / y) * 100).toFixed(p || 2);
  };

  return (window._u = {
    l_scale: l_scale,
    check: check,
    tmpl: tmpl,
    dwnld: dwnld,
    percent: percent,
    network_error: network_error,
    get_query_param: get_query_param,
    set_query_param: set_query_param
  });
});
