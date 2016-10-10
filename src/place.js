define(['summary'], (summary) => {
  var init = (country) => {
    _d.place['adm0']      = country['iso3'];
    _d.place['adm0_name'] = country['name'];
    _d.place['adm0_code'] = country['code'];

    _d.place['callback'] = [
      'adm1',
      (...args) => {
        if (typeof args[2] === 'number') {
          summary.fetch();
          $('[data="adm1_name"]').closest('.with-dropdown').show();
        }

        else {
          console.info(`This adm1 is dodgy: ${ args[2] }. Assuming adm0...`);
          $('[data="adm1_name"]').closest('.with-dropdown').hide();
        }
      }
    ];

    _d.place['callback'] = [
      'adm2',
      (...args) => {
        if (typeof args[2] === 'number') {
          summary.fetch();
          $('[data="adm2_name"]').closest('.with-dropdown').show();
        }

        else {
          console.info(`This adm2 is dodgy: ${ args[2] }. Assuming adm1...`);
          $('[data="adm2_name"]').closest('.with-dropdown').hide();
        }
      }
    ];
  };

  var nullify = (adm) => {
    _d.place[adm] = undefined;
    _d.place[`${ adm }_name`] = undefined;

    if (location.getQueryParam(adm))
      history.pushState(null, null, location.updateQueryParam(adm, null));
  };

  var set = (adm, id, name, push) => {
    _d.place[adm]             = id;
    _d.place[`${ adm }_name`] = name;

    if (push) history.pushState(null, null, location.updateQueryParam(adm, id));
  };

  return {
    set: set,
    init: init,
    nullify: nullify
  };
});
