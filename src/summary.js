define(['d3', 'pie'], (d3, pie) => {
  var tech_colors = _g.technologies.map((t) => { if (t) return t['color'] });

  var fetch = () => {
    let adm = (() => {
      if (!_d.place['adm2']) return 'adm1';
      else return 'adm2';
    })();

    let x = _d.place['adm2'] || _d.place['adm1'];

    if (!x || !adm) {
      console.warn("Summary Fetch: Not enough arguments.");
      return false;
    }

    d3.queue()
      .defer(d3.json,
             `${ _conf['data_source'] }/${ adm }_records?` +
             `select=results` +
             `&cc=eq.${ _d.place['adm0_code'] }` +
             `&scn=eq.${ _d.scenario['scn'] }` +
             `&adm=eq.${ _d.place[adm] }`)
      .await((error, results) => {
        if (error) console.log(error);

        let r = results.map((x) => x['results']).sort_p('tech', true);

        pies(r);
        numbers(r);
        _d.summary['results'] = r;
      });
  };

  var handle_totals = (obj) => {
    return {
      pts: obj.reduce(((a,b) => a + b['pts']), 0),
      connections: obj.reduce(((a,b) => a + b['connections']), 0),
      capacity: obj.reduce(((a,b) => a + b['capacity']), 0),
      investments: obj.reduce(((a,b) => a + b['investments']), 0)
    }
  };

  var pies = (obj) => {
    $('#pies-table').html("");
    $('#techs-table').html("");

    let totals = handle_totals(obj);

    _u.tmpl('#pies-header-template', '#pies-table');

    _u.tmpl('#pies-subheader-template', '#pies-table',
            totals['pts'].toLocaleString(),
            totals['connections'].toLocaleString(),
            (totals['capacity'] / 1000000).toFixed(2).toLocaleString(),
            (totals['investments'] / 1000000).toFixed(2).toLocaleString()
           );

    let colors = tech_colors.reduce(((x,c,i) => { if (obj.map((r) => r['tech']).indexOf(i) > -1) x.push(c); return x }), []);

    _g.technologies.map((t,i) => {
      let c = obj.find((x) => x['tech'] === i);

      if (!c) return;

      _u.tmpl(
        '#pies-tech-tr-template',
        '#techs-table',
        t['name'], t['color']
      );
    });

    _u.tmpl('#pies-graphs-template', '#pies-table');

    for (let k of ['connections', 'investments', 'pts', 'capacity']) {
      let chart = pie.chart(
        `#${ k }`,
        obj.map((r) => { return [0,(r[k]/totals[k])*100] }),
        ((['connections', 'investments'].indexOf(k) > -1) ? 50 : 30),
        colors, " "
      );

      chart.change(1);
    }

    show();
  };

  var numbers = (obj) => {
    $('#numbers').html("");

    let totals = handle_totals(obj);

    _u.tmpl('#numbers-header-template', '#numbers');

    _u.tmpl(
      '#numbers-subheader-template',
      '#numbers',
      totals['pts'].toLocaleString(),
      totals['connections'].toLocaleString(),
      totals['capacity'].toLocaleString(),
      totals['investments'].toLocaleString()
    );

    _g.technologies.map((t,i) => {
      let c = obj.find((x) => x['tech'] === i);

      if (!c) return;

      _u.tmpl(
        '#numbers-count-template',
        '#numbers',
        t['name'], t['color'],
        c['pts'].toLocaleString(), _u.percent(c['pts'], totals['pts']),
        c['connections'].toLocaleString(), _u.percent(c['connections'],totals['connections']),
        c['capacity'].toLocaleString(), _u.percent(c['capacity'],totals['capacity']),
        c['investments'].toLocaleString(), _u.percent(c['investments'],totals['investments'])
      );
    });

    show();
  };

  var toggle = () => {
    $('#numbers').toggleClass('hidden');
    $('#pies').toggleClass('hidden');
  };

  var show = () => {
    $('#summary-info').removeClass('hidden');
  };

  var hide = () => {
    $('#summary-info').addClass('hidden');
  };

  var init = () => {
    $('.export-summary').on('click', (e) => {
      e.preventDefault();

      let adm   = (_d.place['adm2'] ?            "2"              : "1");
      let adm_v = (_d.place['adm2'] ? _d.place['adm2'] : _d.place['adm1']);

      _u.dwnld(JSON.stringify({
        location: _d.place,
        scenario: _d.scenario['scn'],
        technology_results: _d.summary['results']
      }), `summary-${ _d.place['adm0_code'] }-adm${ adm }-${ adm_v }-${ _d.scenario['scn'] }.json`);
    });

    $('#toggle-summary-charts').on('click', (e) => {
      e.preventDefault();
      $(e.target).closest('.clickable').toggleClass('active');

      toggle();
    });
  };

  return {
    init: init,
    fetch: fetch,
    show: show,
    hide: hide
  };
});
