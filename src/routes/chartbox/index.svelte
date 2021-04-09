<script>
  import * as d3 from 'd3'
  import WaterfallGraph from '$lib/charts/WaterfallGraph.svelte'
  import { single_only } from '$lib/map/select_modes.js'
  import QueryMap from './QueryMap.svelte'
  import default_layerlist from './field_to_layer.json'
  import DatePicker from '$lib/datepicker/DatePicker.svelte'
  import ColorPicker from '$lib/ToggledColorPicker.svelte'
  import { query } from '$lib/api.js'

  let filename = 'waterfall'
  let datefield = 'time'
  let table = 'hourly_materialised'
  let startDate = new Date(2020, 0, 1)
  let endDate = new Date(2020, 10, 1)
  let layerlist = default_layerlist
  let allowedlayers = ['sa2_2018_code']
  let match
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

    const projection = { _id: false, time: true, count: true }
    const pipeline = [{ $match: newmatch }, { $project: projection }]

    return pipeline
  }

  let period = 7 * 24 * 3600000
  let offset = 3.5 * 24 * 3600000
  // let colorScale = d3.scaleLinear().domain([0, 14]).range(['white', 'darkblue'])
  // let strokecolorScale = d3.scaleLinear().domain([14, 0]).range(['white', 'darkblue'])
  let opacity = 0.3 //= d3.scaleLinear().domain([0,16]).range([0.2,0.7])

  let options = {
    // height:420*1.14,
    // width:595*1.14,
    xdomain: [0, period],
    ydomain: [0, 1000],
    yaccessor: d => +d.count,
    xaccessor: d => d.offset
    // stroke:(d,i)=>"darkblue",
    // stroke:(d,i)=>strokecolorScale(i),
    //line_only:true,
    // fill: (d,i)=>"none",
    // fill: (d,i)=>colorScale(i),
    // fillOpacity:(d,i)=>1
  }

  let width

  let brokenaxis = 0
  let position
  let x_position = 0.25 //fraction of height
  let y_position = 0.05 //fraction of width
  let plotwidth = 0.5 //fraction of width
  let stroke = '#000000'
  let fill = '#ffffff'
  let background = '#eeeeee'
  let filled = false
  let closed = false
  let hasbackground = false

  function clean(data) {
    let groups = {}
    let _groups = {}
    data.map(function (d) {
      d.time = new Date(d.time)
      d.cycle = Math.floor((+d.time - offset) / period)
      d.offset = (+d.time - offset) % period
    })

    data.sort((a, b) => a.time - b.time)
    options.yextent = d3.extent(data, options.yaccessor)
    options.ydomain[1] = options.yextent[1]

    data.map(function (d) {
      if (_groups[d.cycle]) {
        _groups[d.cycle].data.push(d)
      } else {
        _groups[d.cycle] = { data: [d] }
      }
    })

    let _values = Object.values(_groups)
    _groups = Object.entries(_groups)

    let gmax = _values.sort((a, b) => b.data.length - a.data.length)[1]

    _groups.map(d => {
      if (d[1].data.length >= gmax.data.length) {
        groups[d[0]] = d[1]
      }
    })

    return groups
  }

  $: dbfield = layerlist[currentlayer].db.field
  $: selection = layerlist[currentlayer].map.selection
  $: match = make_match(selection, dbfield, datefield, startDate, endDate)
  $: position = [x_position, y_position]
  $: console.log(stroke, fill)

  let data
  function plot() {
    data = query('population', table, match).then(clean)
  }
  let chartdiv
  $: if (chartdiv) {
    width = chartdiv.getBoundingClientRect().width - 12
  }
</script>

<section class="container-fluid select-wrapper">
  <div class="row">
    <div class="col-md-5">
      <div class="box">
        <!-- <Clear clearfn = {cleardateselection}></Clear> -->
        <div class="columns select-wrapper">
          <div class="column">
            <p>Filter by date</p>
            <div class="select control is-fullwidth">
              <div class="flex">
                <DatePicker bind:selected={startDate} isAllowed={date => date <= endDate} />
                <DatePicker bind:selected={endDate} isAllowed={date => date >= startDate} />
              </div>
              <div>
                <button on:click={plot}> Plot </button>
              </div>
            </div>
          </div>
        </div>
        <div class="columns select-wrapper">
          <div class="column" />
        </div>
      </div>
      <div class="box">
        <!-- <Clear clearfn = {clearmapselection}></Clear> -->
        <p>Select an area</p>
        <div>
          <QueryMap height="700" selectMode={single_only} {allowedlayers} bind:layerlist currentlayer={0} />
        </div>
      </div>
    </div>
    <div class="col-md-7">
      <div class="box">
        <div class="flex" id="numbers">
          <input type="number" step="0.05" min="0.05" max="0.95" bind:value={x_position} />
          <input type="number" step="0.05" min="-1" max="1" bind:value={y_position} />
          <input type="number" step="0.05" min="0.05" max="1" bind:value={plotwidth} />
          <input type="number" step="0.05" bind:value={brokenaxis} />
          <input type="number" step="0.05" min="0.05" max="1" bind:value={opacity} />
        </div>
        <div class="flex">
          <ColorPicker bind:toggle={closed} bind:color={stroke} label="Closed" />
          {#if closed}
            <ColorPicker bind:toggle={filled} bind:color={fill} label="Filled" />
          {/if}
          <ColorPicker bind:toggle={hasbackground} bind:color={background} label="Background" />

          <div style="padding:5px">
            <label for="filename">Filename</label>
            <input type="text" placeholder="waterfall" bind:value={filename} />
          </div>
        </div>
      </div>
      <div class="box" bind:this={chartdiv}>
        {#if data}
          {#await data}
            {JSON.stringify(options)}
          {:then groups}
            <WaterfallGraph
              {groups}
              bind:position
              bind:plotwidth
              bind:brokenaxis
              {filename}
              stroke={(d, i) => stroke}
              fill={(d, i) => fill}
              fillOpacity={(d, i) => opacity}
              {closed}
              {filled}
              {background}
              {hasbackground}
              {width}
              height={(width * 420) / 595}
              {...options}
            />
          {/await}
        {/if}
      </div>
    </div>
  </div>
</section>

<style type="text/scss">
  button {
    width: 100%;
  }

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

  #numbers input {
    width: 17%;
  }
</style>
