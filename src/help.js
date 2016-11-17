define([], () => {
  var enabled = false;

  var dictionary = {
    'adm0_name': "The country button. It simply zooms the map out to the entire country.",
    'adm1_name': "State or province. It zooms out to that area and allows you to use certain functions under the menu.",
    'adm2_name': "District. It zooms out to that area and allows you to use certain functions under the menu.",
    'scenario': `A <strong>scenario</strong> is the combination of the <strong>Tier of access</strong> (it determines the electricity
                 consumption level per household) and the international <strong>diesel price</strong> (current and projected).<br />
                 You can drag the knob (or click on the icons) to alter the <strong>Tier of access</strong> and click the central button to alter
                 the <strong>diesel price</strong>. <br />
                 This tool only has effect if the mode is set to <strong>'Technology'</strong> or <strong>'SA LCOE'</strong>.`,
    'mode': `A <strong>mode</strong> represents on of several datasets in this model. The main one is technology. Every cell will represent it's data based on this mode.`,
    'technology': `<strong>Technology</strong> represents the least cost electrification option at each geographic cell for the selected scenario. <br />
                   This is the default mode.`,
    'lcoe': `This mode represents the lowest levelized cost of generating electricity at each geographic cell for the selected scenario.`,
    'ic': `This mode represents the investment needs in power capacity at each geographic cell for the selected scenario (in USD).`,
    'in': `This mode represents the investment needs in power capacity per new connections at state and district level (in USD).`,
    'nc': `This mode represents the additional power capacity needs at each geographic cell for the selected scenario (in W).`,
    'population': `This mode represents the projected population in 2030.`,
    'poverty': `This mode represents the poverty rate in state and district level.`,
    'urban-rural': `This mode represents whether a geographic location is considered urban or rural.`,
    'ghi': `This mode represents the Global Horizontal Irradiance (in kWh/m<sup>2</sup>).`,
    'w_cf': `This mode represents the Wind power capacity factor.`,
    'hp': `This mode represents the mini and small hydro power potential (in W).`,
    'lcsa': `This mode represents the cost of generating electricity using diesel generators (in USD/kWh).`,
    'rd': `This mode represents the distance to the existing road network (in km). The dataset can be found <a href="https://ifc.ds.io/">here</a>.`,
    'gd_c': `This mode represents the distance to the existing transmission network (in km). <br />
             The dataset can be found <a href="https://ifc.ds.io/">here</a>.`,
    'gd_p': `This mode represents the distance to the existing planned transmission network (in km). <br />
             The dataset can be found <a href="https://ifc.ds.io/">here</a>.`,
    'summary': `This pane shows the <strong>summary</strong> of the current loaded cells. <br />
                It changes constantly depending on which administrative region is loaded each time.`,
    'point': `A <strong>cell</strong> is the main object of this model. <br />
              It represents an area of ca 1km<sup>2</sup> where the least electrification technology has been selected.`,
    'point_info': `This pane shows the results and the underlying demographic, resource and infrastructure for a selected cell. <br />
                   You can lock a cell to this pane by clicking it on the map. Click on it again or click another cell to unlock it. <br />
                   This pane will also change depending on what cell you have locked on the map.`,
    'adm0': "This is the country.",
    'adm1': `This is a <strong>state</strong> or <strong>province</strong>.<br />
             You can click on one of its districts (or LGAs) or click on the navbar for more actions.`,
    'adm2': `This is a <strong>district</strong> or a <strong>Local Government Area (LGA)</strong> .<br />
             You can hover and select cells within it, change the scenario and mode on the controls...`,
    'help': `Help mode enabled. I will tell you what everything is when you click on it.<br />
             To turn it off, just click on Help again.`
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
    load(dictionary['help']);

    document.addEventListener('click', click_event, true);
  };

  var disable = () => {
    document.removeEventListener('click', click_event, true);
    $('#help, #messages-container').addClass('hidden');
  };

  $('#toggle-help').on('click', (e) => {
    e.preventDefault();

    enabled = !enabled;
    $(e.target).closest('.clickable').toggleClass('active');
    $('[help-data]').toggleClass('has-help');

    enabled ? enable() : disable();
  });

  $('#help, #messages-container').on('click', (e) => {
    $('#help, #messages-container').addClass('hidden');
  });
});
