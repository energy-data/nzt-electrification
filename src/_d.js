define(['_g'], (_g) => {
  var binder = () => {
    return new Proxy({}, {
      get: function(target, property) {
        return target[property];
      },

      set: function(target, property, value, receiver) {
        if ((property === 'callback') && (typeof value === 'object')) {
          if (!target['callbacks'])
            target['callbacks'] = {};

          target['callbacks'][value[0]] = value[1];

        } else {
          target[property] = value;

          let elem = (target['scope'] ? document.getElementById(target['scope']) : null);

          let divs = (elem ? elem : document).querySelectorAll(`[data='${ property }']`);

          if (divs.length)
            for (d of divs) d.innerText = (value ? value : "");
        }

        if (target['callbacks'] && target['callbacks'][property])
          target['callbacks'][property].apply(null, arguments);

        return true;
      }
    });
  };

  _d = {};

  for (let o of _g.bound_objects) {
    _d[o['name']] = binder();
    _d[o['name']]['scope'] = o['scope'];
  }

  return (window._d = _d);
});
