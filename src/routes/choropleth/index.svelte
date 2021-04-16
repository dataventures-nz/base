<script>
  import * as df from 'date-fns'
  import { single_only } from '$lib/map/select_modes.js'
  import Choropleth from './Choropleth.svelte'
  import DatePicker from '$lib/datepicker/DatePicker.svelte'
  import ChartPrinter from '$lib/charts/ChartPrinter.svelte'
  import { timeparse } from '$lib/_utils/utils.js'
  import { query, getSchema, extents } from '$lib/api.js'
  import { mappable_fields, time_fields } from '$lib/_utils/schemautils.js'

  let filename = 'graph'
  let datefield = 'time'
  let table = 'hourly_materialised'
  const db = 'population'
  let date = new Date(2020, 3, 1)
  let hours = 12
  let layerlist
  let layer
  let allowedlayers = ['sa2_2018_code']
  let currentlayer = 0
  let selection = []
  let dbfield = ''
  let startDate,endDate

$: startDate = df.add(date,{hours})
$: endDate = df.add(date,{hours:hours+1})


  let mapLayerPromise = getSchema(`&${db}/${table}`)
    .then(d => mappable_fields(d))
    .then(d => {
      layerlist = d.filter(d=>d.map.name=="sa2")
      layer =layerlist[0]
      return true
    })

  function make_match(dbfield, datefield, startDate, endDate) {
    let newmatch = {}
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
      sa2_2018_code: true,
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
    })
    data.sort((a, b) => a.time - b.time)
    return data
  }

  function getdata(startDate,endDate) {
    const match = make_match(dbfield, datefield, startDate, endDate)
    const data = query('population', table, match).then(clean)
    return data 
  }

  let data 
  $: data = getdata(startDate,endDate)

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
                <DatePicker bind:selected={date}/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="box">
        <div class="flex" style="padding:5px">
          <label for="filename">Filename</label>
          <input type="text" placeholder="polargraph" bind:value={filename} />
          <ChartPrinter {filename} {svg} />
        </div>
      </div>
    </div>
    <div class="col-md-7">
      <div class="box">
        {#await mapLayerPromise}
          Map layer not found?
        {:then m}
          <Choropleth 
            height={850} 
            {layer}
            {data}
            />
        {/await}
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
