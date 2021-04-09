<script>
  import PolarGraph from '$lib/charts/polargraph/PolarGraph.svelte'
  import PolarTrace from '$lib/charts/polargraph/PolarTrace.svelte'
  import { xor_only } from '$lib/map/select_modes.js'
  import QueryMap from './QueryMap.svelte'
  import default_layerlist from './field_to_layer.json'
  import DatePicker from '$lib/datepicker/DatePicker.svelte'
  import { query } from '$lib/api.js'
  import ChartPrinter from '$lib/charts/ChartPrinter.svelte'
  let filename = 'polargraph'
  let datefield = 'time'
  let table = 'hourly_materialised'
  let startDate = new Date(2020, 3, 1)
  let endDate = new Date(2020, 5, 1)
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

    const projection = { _id: false, time: true, count: true }
    const pipeline = [{ $match: newmatch }, { $project: projection }]

    return pipeline
  }

  function clean(data) {
    data.map(function (d) {
      d.time = new Date(d.time)
      d.r = +d.count
      d.theta = d.time.getDay() + d.time.getHours() / 24
    })
    data.sort((a, b) => a.time - b.time)
    return data
  }

  let plotRadius = 350

  let options = {
    plotRadius,
    labelAccessor: d => d.time,
    thetaMax: 7,
    showPoints: false,
    axisTitles: new Array(7).fill(''),
    arcOptions: {
      labels: new Array(14).fill(''),
      inner: 0.85 * plotRadius,
      outer: 0.9 * plotRadius,
      offset: -0.5
    }
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
        <QueryMap height="700" selectMode={xor_only} {allowedlayers} bind:layerlist currentlayer={0} />
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
        <div class="col-md-9" bind:this={chartdiv}>
          <PolarGraph bind:svg {...options}>
            {#if dataarrays}
              {#each Object.values(dataarrays) as dataarray, i}
                {#await dataarray.data then d}
                  <PolarTrace data={d} bind:str={dataarray.color} />
                {/await}
              {/each}
            {/if}
          </PolarGraph>
        </div>
        <div class="col-md-3">
          {#each Object.values(dataarrays) as dataarray, i}
            <label for="filename">{dataarray.selection.name}</label>
            <input type="color" bind:value={dataarray.color} />
          {/each}
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
