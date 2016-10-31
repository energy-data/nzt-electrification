define(['summary', 'nanny'], (summary, nanny) => {
  var setup = () => {
    _d.place['callback'] = [
      'adm0_code',
      (...args) => {
        if (typeof args[2] === 'number') {
          if (!_d.place['adm1'] && !_d.place['adm2']) summary.fetch();
        }

        else {
          console.info(`adm0: ${ args[2] }...`);
        }
      }
    ];

    _d.place['callback'] = [
      'adm1',
      (...args) => {
        if (typeof args[2] === 'number') {
          if (!_d.place['adm2']) summary.fetch();
        }

        else {
          console.info(`adm1: ${ args[2] }`);
        }
      }
    ];

    _d.place['callback'] = [
      'adm2',
      (...args) => {
        if (typeof args[2] === 'number') {
          summary.fetch();
        }

        else {
          console.info(`adm2: ${ args[2] }`);
        }
      }
    ];

    _d.place['callback'] = [
      'adm2_name',
      (...args) => {
        if (args[2] == false || args[2] == null || args[2] == undefined) {
          $('#adm2-arrow').html("&nbsp;");
        }

        else {
          $('#adm2-arrow').html("&rarr;");
        }
      }
    ];

    _d.place['callback'] = [
      'adm1_name',
      (...args) => {
        if (args[2] == false || args[2] == null || args[2] == undefined) {
          $('#adm2-arrow').html("&nbsp;");
        }

        else {
          $('#adm2-arrow').html("&rarr;");
        }
      }
    ];

    _d.place['adm2_name'] = null;
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
    if (push) history.pushState(null, null, _u.set_query_param(adm, id));

    _d.place[adm]             = id;
    _d.place[`${ adm }_name`] = name;

    nanny.tell();
  };

  return {
    set: set,
    setup: setup,
    init: init,
    nullify: nullify
  };
});
