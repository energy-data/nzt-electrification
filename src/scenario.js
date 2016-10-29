define(['summary'], (summary) => {
  var setup = (points) => {
    _d.scenario['callback'] = [
      'scn',
      (...args) => {
        var t = args[2];

        if (_g.scenarios.indexOf(t) < 0)
          throw Error(`This scenario is dodgy: ${ t }`);

        else {
          summary.fetch();

          if (['technology', 'lcsa'].indexOf(_d.mode['type']) > -1)
            $('.loading').fadeIn(points.draw);
        }
      }
    ];

    _d.scenario['callback'] = [
      'tier',
      (...args) => {
        var t = args[2];

        if ([...Array(5).keys()].indexOf(t-1) < 0)
          throw Error(`This tier is dodgy: ${ t }`);

        else
          _d.scenario['scn'] = `${ _d.scenario['diesel_p'] }${ t }`;
      }
    ];

    _d.scenario['callback'] = [
      'diesel_p',
      (...args) => {
        var t = args[2];

        if (["l", "n"].indexOf(t) < 0)
          throw Error(`This diesel price is dodgy: ${ t }`);

        else
          _d.scenario['scn'] = `${ t }${ _d.scenario['tier'] }`;
      }
    ];

    load_selector();
  };

  var init = () => {
    _d.scenario['scn'] = 'n1';
    _d.scenario['diesel_p'] = 'n';
    _d.scenario['tier'] = 1;
  };

  var clear_selector = () => {
    $('#scenario-selector select').html("");
  };

  var expand = (t) => {
    _u.check(t[0], t[1]);

    var str = "";
    str += (t[0] === "l" ? "Low" : "NPS") + " " + t[1];
  };

  var load_selector = () => {
    clear_selector();

    var sss = '#scenario-selector select';

    _g.scenarios.forEach((t) => {
      _u.tmpl(
        '#scenario-option-template',
        sss,
        t, expand(t)
      );
    });

    $(sss).on('change', (e) => {
      var v = $(e.target).val();
      var ds = _d.scenario;

      ds['scn']      = v;
      ds['diesel_p'] = v[0];
      ds['tier']     = parseInt(v[1]);
    });

    $(sss).val(_d.scenario['scn']);
  };

  return {
    setup: setup,
    init: init
  };
});
