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

    u.tmpl('#summary-count-template',
           '#summary-info table',
           "Total", null, obj.reduce(((x,y) => x + y['pts']), 0));

    _g.technologies.map((t,i) => {
      let c = obj.find((x) => x['tech'] === i);

      if (!c) return;

      u.tmpl('#summary-count-template',
             '#summary-info table',
             t['name'], t['color'], c['pts']);
    });

    $('#summary-info').show();
  };

  return {
    fetch: fetch,
    handle: handle
  };
});
