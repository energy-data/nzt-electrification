define([], () => {
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
    return ((x / y) * 100).toFixed(p || 2) + "%";
  };

  return (window._u = {
    check: check,
    tmpl: tmpl,
    dwnld: dwnld,
    percent: percent
  });
});
