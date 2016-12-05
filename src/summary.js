define(['d3', 'pie'], (d3, pie) => {
  var fetch = (o) => {
    var adm_type = (() => {
      if (o['adm2']) return 'adm2';
      else if (o['adm1']) return 'adm1';
      else return 'adm0';
    })();

    if (!adm_type || !_u.get_query_param('iso3') || !_d.scenario['scn']) {
      console.warn("Summary Fetch: Not enough arguments.");
      return false;
    }

    var url = `${ _conf['data_source'] }/${ adm_type }_records?` +
        `select=results` +
        `&cc=eq.${ _d.place['adm0_code'] }` +
        `&scn=eq.${ _d.scenario['scn'] }`;

    if (adm_type != 'adm0') url += `&adm=eq.${ o[adm_type] }`;

    d3.queue()
      .defer(d3.json, url)
      .await((error, results) => {
        if (error) _u.network_error();

        var r = results[0]['results'].sort_p('tech', true);

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

    var totals = handle_totals(obj);

    _u.tmpl('#pies-subheader-template', '#pies-table',
            totals['pts'].toLocaleString(),
            totals['connections'].toLocaleString(),
            (totals['capacity'] / 1000000).toFixed(2).toLocaleString(),
            (totals['investments'] / 1000000).toFixed(2).toLocaleString()
           );

    _u.tmpl('#tech-header-template', '#techs-table');

    var filtered_techs = _g.technologies.filter((c) => obj.find_p('tech', c['tech']));

    filtered_techs.map((t) => {
      _u.tmpl(
        '#tech-tr-template',
        '#techs-table',
        t['name'], t['color']
      )
    });

    _u.tmpl('#pies-graphs-template', '#pies-table');

    var radius = Math.min.apply(null, [$('#pies-table td').width(), 120]) /2;

    ['connections', 'investments', 'pts', 'capacity'].forEach((k) => {
      var chart = pie.chart(
        `#${ k }`,
        obj.map((r) => { return [0, (r[k]/totals[k]) * 100] }),
        radius, 0, filtered_techs.sort_p('tech').map((t) => t['color']).reverse(), " "
      );

      chart.change(1);
    });

    _u.tmpl('#pies-header-template', '#pies-table');
  };

  var numbers = (obj) => {
    $('#numbers').html("");

    var totals = handle_totals(obj);

    _u.tmpl('#numbers-header-template', '#numbers');

    _u.tmpl(
      '#numbers-subheader-template',
      '#numbers',
      totals['pts'].toLocaleString(),
      totals['connections'].toLocaleString(),
      totals['capacity'].toLocaleString(),
      totals['investments'].toLocaleString()
    );

    _g.technologies
      .map((t,i) => {
        return obj.find((x) => {
          var target = (x['tech'] === t['tech']);

          if (target) {
            x['name']  = t['name'];
            x['color'] = t['color'];
          }

          return target;
        })
      })
      .sort_p('connections', true)
      .forEach((c) => {
        if (!c) return;

        _u.tmpl(
          '#numbers-count-template',
          '#numbers',
          c['name'], c['color'],
          c['pts'].toLocaleString(), _u.percent(c['pts'], totals['pts']),
          c['connections'].toLocaleString(), _u.percent(c['connections'],totals['connections']),
          c['capacity'].toLocaleString(), _u.percent(c['capacity'],totals['capacity']),
          c['investments'].toLocaleString(), _u.percent(c['investments'],totals['investments'])
        );
      });

    show();
  };

  var toggle = () => {
    $('#details-modal').toggle()
  };

  var show = () => {
    $('#summary-info').removeClass('hidden');
  };

  var hide = () => {
    $('#summary-info').addClass('hidden');
  };

  var setup = () => {
    $('.export-summary').on('click', (e) => {
      e.preventDefault();

      var adm   = (_d.place['adm2'] ?            "2"              : "1");
      var adm_v = (_d.place['adm2'] ? _d.place['adm2'] : _d.place['adm1']);

      _u.dwnld(JSON.stringify({
        location: _d.place,
        scenario: _d.scenario['scn'],
        technology_results: _d.summary['results']
      }), `summary-${ _d.place['adm0_code'] }-adm${ adm }-${ adm_v }-${ _d.scenario['scn'] }.json`);
    });

    $('.toggle-summary-charts').on('click', (e) => {
      e.preventDefault();
      toggle();
    });
  };

  return {
    setup: setup,
    fetch: fetch,
    show: show,
    hide: hide
  };
});
