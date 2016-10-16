define([], () => {
  var enabled = false;

  var dictionary = {
    adm0_name: "The country button. It simply zooms the map out to the entire country.",
    adm1_name: "State or province. It zooms out to that area and allows you to use certain functions under the menu.",
    adm2_name: "District. It zooms out to that area and allows you to use certain functions under the menu.",
    scenario: `A <strong>scenario</strong> is a combination of a <strong>tier</strong> (kWh capacity given to a certain cell) and a <strong>diesel price</strong> (current and projected).<br />
               You can drag the knob (or click on the icons) and click central button to combine these 2 aspects. <br />
               This tool only has effect if the mode is set to 'Technology' or 'SA LCOE'.`,
    mode: "A <strong>mode</strong> represents on of several datasets in this model. The main one is technology. Every cell will represent it's data based on this mode.",
    summary: `This pane will show the <strong>summary</strong> of the current loaded cells. <br />
              It will change constantly depending which administrative region that is loaded.`,
    point: `A <strong>cell</strong> is the main object of this model. <br />
            It represents an area of 1km<sup>2</sup> where a technology has been selected for electrification`,
    point_info: `Everything is to know about the currently focused cell. <br />
                 You can lock a cell to this pane by clicking on it on the map. Click it again or click another cell to unlock it. <br />
                 This pane will also change depending on what cell you have locked on the map.`,
    adm0: "This is the country.",
    adm1: `This is a <strong>state</strong> or <strong>province</strong>.<br />
           You can click on one of its district or click on the navbar for more actions.`,
    adm2: `This is a <strong>district</strong>.<br />
           You can hover and select grids within it, change the scenario and mode on the controls...`
  };

  var click_event = (e) => {
    if (! enabled) return;

    if ($(e.target).hasClass('point')) {
      load(dictionary['point'])
      return;

    } else if ($(e.target).hasClass('adm1')) {
      load(dictionary['adm1']);
      return;

    } else if ($(e.target).hasClass('adm2')) {
      load(dictionary['adm2']);
      return;

    } else {
      var $target = $(e.target).closest('[help-data]');
      if ($target.length) load(dictionary[$target.attr('help-data')]);
    }
  };

  var load = (str) => {
    $('#help')
      .html(str);

    $('#help, #messages-container')
      .removeClass('hidden');
  };

  var enable = () => {
    alert(`
Help mode enabled. I will tell you what everything is when you click on it.
To turn it off, just click on Help again.
`);

    document.addEventListener('click', click_event, true);
  };

  var disable = () => {
    document.removeEventListener('click', click_event, true);
    $('#help, #messages-container').addClass('hidden');
  };

  $('#toggle-help').on('click', (e) => {
    e.preventDefault();

    enabled = !enabled;
    $(e.target).toggleClass('active');
    $('[help-data]').toggleClass('has-help');

    enabled ? enable() : disable();
  });

  $('#help, #messages-container').on('click', (e) => {
    $('#help, #messages-container').addClass('hidden');
  });
});
