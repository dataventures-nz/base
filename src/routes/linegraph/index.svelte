<script>
  import LineGraph from '$lib/charts/linegraph/LineGraph.svelte'
  import LineTrace from '$lib/charts/linegraph/LineTrace.svelte'
  import Pie from '$lib/charts/Pie.svelte'
  import Scatter from '$lib/charts/linegraph/Scatter.svelte'
  import { single_only } from '$lib/map/select_modes.js'
  import QueryMap from './QueryMap.svelte'
  import default_layerlist from './field_to_layer.json'
  import DatePicker from '$lib/datepicker/DatePicker.svelte'
  import { query } from '$lib/api.js'
  import ChartPrinter from '$lib/charts/ChartPrinter.svelte'
  import { timeparse } from '$lib/_utils/utils.js'
  import { foodscale } from '$lib/_utils/yootils.js'

  let filename = 'graph'
  let datefield = 'time'
  let table = 'hourly_materialised'
  let startDate = new Date(2020, 3, 1, 12)
  let endDate = new Date(2020, 3, 2, 12)
  let layerlist = default_layerlist
  let allowedlayers = ['sa2_2018_code']
  let currentlayer = 0
  let selection = []
  let dbfield = ''

  function make_match(selection, dbfield, datefield, startDate, endDate) {
    let newmatch = {}
    if (dbfield && selection.length) {
      const idlist = selection.map(d => +d.area_id)
      newmatch[dbfield] = { $in: idlist }
    }

    if (datefield && (startDate || endDate)) {
      newmatch[datefield] = {}
      if (startDate) {
        newmatch[datefield].$gte = startDate
      }
      if (endDate) {
        newmatch[datefield].$lt = endDate
      }
    }

    const projection = {
      _id: false,
      time: true,
      count: true,
      local: true,
      domestic: true,
      international: true,
      unknown: true
    }
    const pipeline = [{ $match: newmatch }, { $project: projection }]

    return pipeline
  }

  function clean(data) {
    data.map(function (d) {
      d.time = timeparse(d.time)
      d.r = +d.count
      d.theta = d.time.getDay() + d.time.getHours() / 24
    })
    data.sort((a, b) => a.time - b.time)
    return data
  }

  let dataarrays = {}

  function addtodataarrays(selection) {
    const match = make_match([selection], dbfield, datefield, startDate, endDate)
    const data = query('population', table, match).then(clean)
    return { selection, data, color: '#' + Math.floor(Math.random() * 16777215).toString(16) }
  }

  $: dbfield = layerlist[currentlayer].db.field
  $: if (selection) {
    selection = JSON.parse(JSON.stringify(layerlist[currentlayer].map.selection))
    let newdataarrays = {}
    selection.map(function (s) {
      newdataarrays[s.name] = dataarrays[s.name] || addtodataarrays(s)
    })
    dataarrays = newdataarrays
  }

  let svg
  let width
  let chartdiv
  $: if (chartdiv) {
    width = chartdiv.getBoundingClientRect().width - 12
  }

  let layers = [
    {
      name: 'y1',
      accessor: d => +d.local,
      style: { fill: 'pink', stroke: 'none', 'fill-opacity': 0.5 },
      active: false
    },
    {
      name: 'y2',
      accessor: d => +d.domestic + +d.local + +d.international + +d.unknown,
      style: { fill: 'yellow', stroke: 'none' },
      active: true
    },
    {
      name: 'y2',
      accessor: d => +d.international,
      style: { fill: '#000', 'fill-opacity': 0.1 },
      active: false
    },
    {
      name: 'y2',
      accessor: d => +d.unknown,
      style: { fill: 'green', stroke: 'none' },
      active: false
    }
  ]

</script>

<section class="container-fluid select-wrapper">
  <div class="row">
    <div class="col-md-5">
      <div class="box">
        <div class="columns select-wrapper">
          <div class="column">
            <p>Filter by date</p>
            <div class="select control is-fullwidth">
              <div class="flex">
                <DatePicker bind:selected={startDate} isAllowed={date => date <= endDate} />
                <DatePicker bind:selected={endDate} isAllowed={date => date >= startDate} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="box">
        <p>Select an area</p>
        <QueryMap height={700} selectMode={single_only} {allowedlayers} bind:layerlist currentlayer={4} />
      </div>
    </div>
    <div class="col-md-7">
      <div class="box">
        <div class="flex" style="padding:5px">
          <label for="filename">Filename</label>
          <input type="text" placeholder="polargraph" bind:value={filename} />
          <ChartPrinter {filename} {svg} />
        </div>
      </div>
      <div class="row box">
        <div class="col-md-12">
          <LineGraph
            bind:svg
            xtime={true}
            width={1000}
            height={600}
            ysuppressZero={false}
            intercepts={'bottom_left'}
            let:xScale
            let:yScale
          >
            {#if Object.values(dataarrays)[0]}
              {#await Object.values(dataarrays)[0].data then d}
                <LineTrace
                  {xScale}
                  {yScale}
                  data={d}
                  xaccessor={d => d.time}
                  yaccessor={layers[1].accessor}
                  style={{ stroke: 'black', 'stroke-width': '0.5px', fill: 'none' }}
                />
                <Scatter data={d} xaccessor={d => d.time} {layers} {xScale} {yScale} let:x let:y let:point>
                  <!-- <rect width=4 height=4 transform={"translate("+(x-2)+","+(y-2)+")"}></rect> -->
                  <g transform={'translate(' + x + ',' + y + ')'}>
                    <image transform="translate(4,-3),rotate(45)" width="70" height="70" href="./assets/orang_transp.png" />
                    <Pie
                      data={point}
                      accessor={d => [+d.domestic, +d.local, +d.international, +d.unknown]}
                      innerRadius={12}
                      outerRadius={20}
                      colorScale={foodscale}
                    />
                    <!-- <image transform="translate(-15,-15)" width="30" height="30" href="./assets/doge.png" /> -->
                    
                  </g>
                </Scatter>
              {/await}
            {/if}
          </LineGraph>
        </div>
      </div>
    </div>
  </div>
</section>

<style type="text/scss">
  input {
    cursor: pointer;
    display: block;
    font-size: 1em;
    max-width: 100%;
    outline: thin;
  }

  .box {
    position: relative;
    border: 1px solid black;
    padding: 5px;
    margin: 5px;
  }

  .flex {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    flex-wrap: wrap;
  }
</style>
