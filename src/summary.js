define(['d3'], (d3) => {
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

        let r = results.map((x) => x['results']);
        handle(r);
        _d.summary['results'] = r;
      });
  };

  var handle = (obj) => {
    $('#summary-info table').html("");

    let total_pts = obj.reduce(((a,b) => a + b['pts']), 0);
    let total_population = obj.reduce(((a,b) => a + b['population']), 0);
    let total_capacity = obj.reduce(((a,b) => a + b['capacity']), 0);
    let total_investments = obj.reduce(((a,b) => a + b['investments']), 0);

    _u.tmpl('#summary-header-template', '#summary-info table');

    _u.tmpl(
      '#summary-subheader-template',
      '#summary-info table',
      total_pts.toLocaleString(),
      total_population.toLocaleString(),
      (total_capacity / 1000).toFixed(2).toLocaleString(),
      total_investments.toLocaleString()
    );

    _g.technologies.map((t,i) => {
      let c = obj.find((x) => x['tech'] === i);

      if (!c) return;

      _u.tmpl(
        '#summary-count-template',
        '#summary-info table',
        t['name'], t['color'],
        c['pts'].toLocaleString(), _u.percent(c['pts'], total_pts),
        c['population'].toLocaleString(), _u.percent(c['population'],total_population),
        c['capacity'].toLocaleString(), _u.percent(c['capacity'],total_capacity),
        c['investments'].toLocaleString(), _u.percent(c['investments'],total_investments)
      );
    });

    $('#summary-info').show();
  };

  return {
    fetch: fetch,
    handle: handle
  };
});
