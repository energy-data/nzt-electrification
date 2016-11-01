define(['summary', 'nanny'], (summary, nanny) => {
  var setup = () => {
    _d.place['callback'] = [
      'adm0_code',
      (...args) => {
        if (typeof args[2] === 'number') {
          if (!_d.place['adm1'] && !_d.place['adm2']) summary.fetch();
        }
      }
    ];

    _d.place['callback'] = [
      'adm1',
      (...args) => {
        if (typeof args[2] === 'number') {
          if (!_d.place['adm2']) summary.fetch();
        }

      }
    ];

    _d.place['callback'] = [
      'adm2',
      (...args) => {
        if (typeof args[2] === 'number') {
          summary.fetch();
        }

      }
    ];
  };

  var nullify = (adm) => {
    _d.place[adm] = undefined;
    _d.place[`${ adm }_name`] = undefined;

    if (_u.get_query_param(adm))
      history.pushState(null, null, _u.set_query_param(adm, null));
  };

  var init = (countries, iso3) => {
    var c = countries.find_p('iso3', iso3);

    _d.place['adm0']      = c['iso3'];
    _d.place['adm0_name'] = c['name'];
    _d.place['adm0_code'] = c['code'];

    document.getElementsByTagName('title')[0].text = `${ c['name'] } - Electrification`;
  };

  var set = (adm, id, name, push) => {
    _d.place[adm]             = id;
    _d.place[`${ adm }_name`] = name;

    if (push) history.pushState(null, null, _u.set_query_param(adm, id));

    nanny.tell();
  };

  return {
    set: set,
    setup: setup,
    init: init,
    nullify: nullify
  };
});
