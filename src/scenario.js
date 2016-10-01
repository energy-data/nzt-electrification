define(['utils', 'summary'], (u, summary) => {
  var init = (points) => {
    load_selector();

    data.scenario['scn'] = 'l1';
    data.scenario['tier'] = 1;
    data.scenario['diesel_p'] = 'l';

    data.scenario['callback'] = [
      'scn',
      (...args) => {
        let t = args[2];

        if (_g.scenarios.indexOf(t) < 0) {
          throw Error(`This scenario is dodgy: ${ t }`);
        }
        else {
          summary.fetch();

          if (data.mode['type'] === 'technology')
            points.draw(data.point_collection['points']);
        }
      }
    ];

    data.scenario['callback'] = [
      'tier',
      (...args) => {
        let t = args[2];

        if ([...Array(5).keys()].indexOf(t) < 0)
          throw Error(`This tier is dodgy: ${ t }`);

        else
          data.scenario['scn'] = `${ data.scenario['diesel_p'] }${ t }`;
      }
    ];

    data.scenario['callback'] = [
      'diesel_p',
      (...args) => {
        let t = args[2];

        if (["l", "n"].indexOf(t) < 0)
          throw Error(`This diesel price is dodgy: ${ t }`);

        else
          data.scenario['scn'] = `${ t }${ data.scenario['tier'] }`;
      }
    ];
  };

  var clear_selector = () => {
    $('#scenario-selector select').html("");
  };

  var expand = (t) => {
    u.check(t[0], t[1]);

    let str = "";
    str += (t[0] === "l" ? "Low" : "NPS") + " " + t[1];
  };

  var load_selector = () => {
    clear_selector();

    let sss = '#scenario-selector select';

    _g.scenarios.map((t) => {
      u.tmpl(
        '#scenario-option-template',
        sss,
        t, expand(t)
      );
    });

    $(sss).on('change', (e) => {
      let v = $(e.target).val();
      let ds = data.scenario;

      ds['scn']      = v;
      ds['diesel_p'] = v[0];
      ds['tier']     = parseInt(v[1]);
    });

    $(sss).val(data.scenario['scn']);
  };

  return {
    init: init
  };
});
