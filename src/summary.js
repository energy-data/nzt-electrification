define(['d3', 'utils'], (d3, u) => {
  var fetch = () => {
    let adm = (() => {
      if (!data.place['adm2']) return 'adm1';
      else return 'adm2';
    })();

    let x = data.place['adm2'] || data.place['adm1'];

    if (!x || !adm) {
      console.warn("Summary Fetch: Not enough arguments.");
      return false;
    }

    d3.queue()
      .defer(d3.json,
             `http://localhost:4000/${ adm }_records?` +
             `select=results` +
             `&cc=eq.${ data.place['adm0_code'] }` +
             `&scn=eq.${ data.scenario['scn'] }` +
             `&adm=eq.${ data.place[adm] }`)
      .await((error, results) => {
        if (error) console.log(error);
        handle(results.map((x) => x['results']));
      });
  };

  var handle = (obj) => {
    $('#summary-info table').html("");

    let total_pts = obj.reduce(((a,b) => a + b['pts']), 0);
    let total_population = obj.reduce(((a,b) => a + b['population']), 0);
    let total_capacity = obj.reduce(((a,b) => a + b['capacity']), 0);
    let total_investments = obj.reduce(((a,b) => a + b['investments']), 0);

    u.tmpl('#summary-header-template', '#summary-info table');

    u.tmpl(
      '#summary-subheader-template',
      '#summary-info table',
      total_pts.toLocaleString(),
      total_population.toLocaleString(),
      total_capacity.toLocaleString(),
      total_investments.toLocaleString()
    );

    _g.technologies.map((t,i) => {
      let c = obj.find((x) => x['tech'] === i);

      if (!c) return;

      u.tmpl(
        '#summary-count-template',
        '#summary-info table',
        t['name'], t['color'],
        c['pts'].toLocaleString(), u.percent(c['pts'], total_pts),
        c['population'].toLocaleString(), u.percent(c['population'],total_population),
        c['capacity'].toLocaleString(), u.percent(c['capacity'],total_capacity),
        c['investments'].toLocaleString(), u.percent(c['investments'],total_investments)
      );
    });

    $('#summary-info').show();
  };

  return {
    fetch: fetch,
    handle: handle
  };
});
