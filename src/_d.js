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

          let div = document.querySelectorAll(`[data='${ property }']`)[0];

          if (div) div.innerText = (value ? value : "");
        }

        if (target['callbacks'] && target['callbacks'][property])
          target['callbacks'][property].apply(null, arguments);

        return true;
      }
    });
  };

  _d = {};

  _g.bound_objects.map((o) => {
    _d[o] = binder();
  });

  window._d = _d;

  return _d;
});
