define(['summary'], (summary) => {
  var init = (points) => {
    load_selector();

    _d.scenario['scn'] = 'n1';
    _d.scenario['tier'] = 1;
    _d.scenario['diesel_p'] = 'n';

    _d.scenario['callback'] = [
      'scn',
      (...args) => {
        let t = args[2];

        if (_g.scenarios.indexOf(t) < 0)
          throw Error(`This scenario is dodgy: ${ t }`);

        else {
          summary.fetch();

          if (['technology', 'lcsa'].indexOf(_d.mode['type']) > -1)
            $('.loading').fadeIn(() => {
              points.draw(_d.point_collection['points']);
            });
        }
      }
    ];

    _d.scenario['callback'] = [
      'tier',
      (...args) => {
        let t = args[2];

        if ([...Array(5).keys()].indexOf(t-1) < 0)
          throw Error(`This tier is dodgy: ${ t }`);

        else
          _d.scenario['scn'] = `${ _d.scenario['diesel_p'] }${ t }`;
      }
    ];

    _d.scenario['callback'] = [
      'diesel_p',
      (...args) => {
        let t = args[2];

        if (["l", "n"].indexOf(t) < 0)
          throw Error(`This diesel price is dodgy: ${ t }`);

        else
          _d.scenario['scn'] = `${ t }${ _d.scenario['tier'] }`;
      }
    ];
  };

  var clear_selector = () => {
    $('#scenario-selector select').html("");
  };

  var expand = (t) => {
    _u.check(t[0], t[1]);

    let str = "";
    str += (t[0] === "l" ? "Low" : "NPS") + " " + t[1];
  };

  var load_selector = () => {
    clear_selector();

    let sss = '#scenario-selector select';

    for (let t of _g.scenarios) {
      _u.tmpl(
        '#scenario-option-template',
        sss,
        t, expand(t)
      );
    };

    $(sss).on('change', (e) => {
      let v = $(e.target).val();
      let ds = _d.scenario;

      ds['scn']      = v;
      ds['diesel_p'] = v[0];
      ds['tier']     = parseInt(v[1]);
    });

    $(sss).val(_d.scenario['scn']);
  };

  return {
    init: init
  };
});
