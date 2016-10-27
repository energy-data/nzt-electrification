# Electrification pathways for Nigeria, Tanzania and Zambia

Geospatial analysis is an effective tool supporting the planning,
implementation and monitoring of basic services delivery in developing
countries, as reflected by an increase in use in a number of
geographies and sectors. Within the energy sector, the use of GIS data
and associated analytical tools can be beneficial in conducting
strategic planning as well as prioritizing and rationalizing energy
infrastructure related investments. The World Bank and
[KTH Division of Energy Systems Analysis](https://www.kth.se/en/itm/inst/energiteknik/forskning/desa/welcome-to-the-unit-of-energy-systems-analysis-kth-desa-1.197296)
have developed National High Resolution Dynamic Least Cost Options Plan for
Universal Access to Electricity in Nigeria, Tanzania and Zambia.
The web-based open source application presented here allows the users to select
among various scenarios regarding levels of electricity consumption
(Tiers of access) and spatially explicit fuel costs and identify the
least cost electrification technology for each 1km by 1km block in the
selected countries.

## Electrification planning using open geospatial data

This GIS based application allows users to navigate through the least
cost electrification options for each locality of 1 by 1 km
(hereinafter settlement) in Nigeria, Tanzania, Zambia. The technology
decision depends on several [spatial parameters](https://ifc.ds.io/).
These include population density, distance from existing and planned transmission
infrastructure, proximity to road network, night-time light, as well
as energy resource availability. For each location, seven
electrification technologies are compared and the least cost system is
selected. In other words, the technology offering the lowest levelized
cost of electricity generated throughout its lifetime, is considered
as the best electrification solution. Results are available for each
settlement. Summaries are provided in state and district level.

This electrification planning toolkit is a complementary approach to already
existing energy planning models that do not consider geospatial attributes related
to energy. It can be used as a screening tool to inform decision making in the
energy field and to bridge science, technology and policy at different levels.
The underlying methodology can be found [\[1\]](http://www.sciencedirect.com/science/article/pii/S0143622816300522)
and the underlying assumptions [\[2\]](http://www.sciencedirect.com/science/article/pii/S0973082615000952).

## Technologies

Covering future electricity demand requires investments in new generating capacity
and here there are two options to be considered. On the one hand new capacity can be
added to the national electricity grid which will then electrify un-served areas through
an extended T&D network spanning throughout the country. On the other hand, new off-grid
capacity can be added, operating either in a form of mini-grids or stand-alone systems
covering the demand in each location based on the local available energy resources.

**Grid** electricity is generated in a centralized manner, usually from large power
plants, which due to economies of scale are able to offer low generating costs.
Electricity then reaches households through the Transmission and Distribution network
in relatively low costs (if the T&D network is well developed e.g. developed countries).
However, the expansion of the electricity grid infrastructure in a country, is a capital
intensive and time demanding process, which requires long term planning and large investments.
A reasonable investment recovery time horizon of such investments requires in turn a
population with high purchasing power and sophisticated consumption patterns. It might not
be economically feasible to extend the central grid if the population to be served will only
demand, and afford, a relatively small quantity of electricity. Therefore, grid extension
might not be the optimal electrification option for low income – low consumption population
in rural areas and particularly in remote areas of developing countries.

<p align="center">
<img src="https://github.com/svexican/nzt-electrification/raw/master/dist/images/Technology_Grid.jpg" />
</p>

<hr />

A **mini grid** is an important alternative to grid extension. In this case electricity
is generated in a decentralized manner, usually from power plants with generating capacity
of few MW. Mini grids are usually deployed based on locally available energy resources such
as solar, hydro, wind or can be based on commonly available fuels like diesel. Requiring no
transmission and modest distribution costs mini grids can provide affordable electricity to
rural and remote areas with low-medium electricity consumption habits. Mini grids based on
renewable sources have usually high upfront costs but no operational (fuel) costs. On the
other hand, diesel generators (gensets) are a mature, low cost technology subjected however
to operational costs depending on diesel pump price fluctuation.

<img width="48%" src="https://github.com/svexican/nzt-electrification/raw/master/dist/images/Technology_Mini_Grid_vertical.png" /><img width="48%" src="https://github.com/svexican/nzt-electrification/raw/master/dist/images/Technology_Mini_Grid_panels.png" />

<hr />

**Stand-alone** systems are usually based on local energy resources in order to produce few kWh
per day, able to cover the electricity demand of a single household. These systems do not
require T&D network; therefore, their capital cost depends only on their size. Batteries may
increase the upfront cost for PV systems while diesel gensets are a mature, low cost technology
subjected however to operational costs depending on diesel pump price fluctuation. Stand-alone
systems are a good electrification option for remote, low populated areas with limited electricity
consumption needs.

<p align="center">
<img src="https://github.com/svexican/nzt-electrification/raw/master/dist/images/Technology_Stand_Alone.PNG" />
</p>

## Scenarios

The electrification planning exercise is carried out for 10
alternative scenarios defined by 5 indicative quantities of
electricity consumption (Tiers of access) and two diesel prices.

### Tiers of Access:

Each tier represents different levels of electricity services provided starting
from basic lighting and recharging a cell phone or a radio (Tier 1) to services that
provide comfort, such as general lighting and continuous use of heavy appliances,
such as refrigeration, air conditioning and eventually cooking. (see Table).
From first to fifth, scenarios increase available amounts of electricity incrementally.

## Mapping of tiers of electricity for indicative services

| Level of access | Tier-0 | Tier-1 | Tier-2 | Tier-3 | Tier-4 | Tier-5 |
|-----------------|--------|--------|--------|--------|--------|--------|
| Indicative appliances powered | Torch and Radio | Task lightning <br />+<br /> Phone charging or Radio | General lightning <br />+<br /> Air circulation <br />+<br /> Television | Tier 2 <br />+<br /> Light appliances <br /> (i.e. general food processing and washing machine) | Tier 3 <br />+<br /> Medium or continuous appliances <br /> (i.e. water heating, ironing, water pumping rice cooking, refrigeration, microwave) | Tier 4 <br />+<br /> Heavy or continuous appliances <br /> (i.e. air conditioning) |
| Consumption per <br /> household and year (kWh) | - | 22 | 224 | 695 | 1800 | 2195 |

### Diesel prices:

The model assumes two international diesel prices, **0.34** US$ per
liter (current international diesel price) and **0.82** US$ per liter
(projected international diesel price), used to calculate diesel costs
in different localities.
