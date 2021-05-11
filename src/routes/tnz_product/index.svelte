<script>
  import Cursor from '$lib/charts/linegraph/Cursor.svelte'
  import LineGraph from '$lib/charts/linegraph/LineGraph.svelte'
  import StackedArea from '$lib/charts/linegraph/StackedArea.svelte'
  import { single_only } from '$lib/map/select_modes.js'
  import QueryMap from './QueryMap.svelte'
  import VertCursor from './VertCursor.svelte'
  import BoxCursor from './BoxCursor.svelte'
  import DatePicker from '$lib/datepicker/DatePicker.svelte'
  import { query } from '$lib/api.js'
  import ChartPrinter from '$lib/charts/ChartPrinter.svelte'
  import * as d3 from 'd3'
  import * as df from 'date-fns'

  let datefield = 'time'
  let collection = 'noon_by_rto'
  let month = df.addMonths(new Date(), -1)
  let monthsvg, aggregatesvg

  let layerlist = [
    {
      db: {
        field: 'RTO_code'
      },
      map: {
        name: 'rto',
        url: 'mapbox://dataventures.clfbgxtb',
        sourcelayer: 'RTO2017-8gz3hf',
        properties: {
          id: 'RTO2017_V1',
          name: 'RTO2017__1'
        },
        selection: []
      },
      ui: {
        visible: false,
        include: false,
        displayname: 'RTO'
      }
    }
  ]

  let selection = []
  let dbfield = ''

  function make_match(selection, dbfield) {
    let newmatch = {}
    if (dbfield && selection) {
      const idlist = [+selection.area_id]
      newmatch[dbfield] = { $in: idlist }
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
      d.Total = +d.count
      d.Domestic = +d.domestic
      d.International = +d.international
      d.Local = +d.local
      d.Unknown = +d.unknown
      d.time = new Date(d.time)
    })
    data.sort((a, b) => a.time - b.time)
    return data
  }

  const grouper = f => (obj, x) => {
    const k = f(x)
    obj[k] = [x, ...(obj[k] || [])]
    return obj
  }

  function reducer(acc, v) {
    acc.n = ++acc.n || 1
    acc.Total = acc.Total + v.Total || v.Total
    acc.Domestic = acc.Domestic + v.Domestic || v.Domestic
    acc.International = acc.International + v.International || v.International
    acc.Local = acc.Local + v.Local || v.Local
    acc.Unknown = acc.Unknown + v.Unknown || v.Unknown
    acc.time = acc.time || df.startOfMonth(v.time)
    acc.mean =
      acc.mean ||
      function (field) {
        return Math.round(this[field] / this.n)
      }
    return acc
  }

  function monthlymean(data) {
    var _data = data.reduce(
      grouper(d => df.format(d.time, 'MMyy')),
      {}
    )
    _data = Object.values(_data).map(d => d.reduce(reducer, {}))
    _data = _data.sort((a, b) => a.time - b.time)
    return _data
  }

  let data

  async function getdata(selection) {
    const match = make_match(selection, dbfield, datefield, month)
    const d = query('population', collection, match).then(clean)
    const data = await d
    const aggregate = monthlymean(data)
    return { selection, data, aggregate }
  }

  $: if (layerlist.length > 0) {
    dbfield = layerlist[0].db.field
  }

  $: if (layerlist.length > 0 && selection) {
    selection = JSON.parse(JSON.stringify(layerlist[0].map.selection))
    data = getdata(selection[0])
  }

  $: datefilter = dataArray => dataArray.filter(d => d.time >= df.startOfMonth(month) && d.time <= df.endOfMonth(month))

  $: console.log({ data, selection })

  let width
  let chartdiv
  $: if (chartdiv) {
    width = chartdiv.getBoundingClientRect().width - 12
  }

  let layers = [
    {
      name: 'Local',
      accessor: d => (d.mean ? d.mean('Local') : d.Local),
      style: { fill: '#5F93DC', stroke: 'none' }
    },
    {
      name: 'Domestic',
      accessor: d => (d.mean ? d.mean('Domestic') : d.Domestic),
      style: { fill: '#ca637f', stroke: 'none' }
    },
    {
      name: 'International',
      accessor: d => (d.mean ? d.mean('International') : d.International),
      style: { fill: '#F5BC61' }
    },
    {
      name: 'Unknown',
      accessor: d => (d.mean ? d.mean('Unknown') : d.Unknown),
      style: { fill: '#ccc', stroke: null }
    }
  ]

  let stack
  function content(sx) {
    if (stack) {
      let m = d3.minIndex(stack[1], d => Math.abs(d.data.time - sx))
      if (stack[1][m]) {
        let d = stack[1][m]['data']
        return [
          df.format(d.time, 'd MMM yyyy'),
          'total: ' + d.count,
          'visitors: ' + (d.domestic * 1 + d.international * 1 + d.unknown * 1)
        ]
      } else {
        return ['something else is wrong']
      }
    }
    return ['something is wrong']
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
                <DatePicker showDays={false} format={'MMMM yyyy'} bind:selected={month} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="box">
        <p>Select an area</p>
        <QueryMap height="700" selectMode={single_only} bind:layerlist currentlayer={0} />
      </div>
    </div>
    <div class="col-md-7">
      <!-- {#if selection[0]} -->
      {#await data then d}
        <div class="row box">
          <div class="col-md-9">
            <LineGraph
              xtime={true}
              width={800}
              ysuppressZero={false}
              intercepts={'bottom_left'}
              bind:svg={monthsvg}
              let:xScale
              let:yScale
            >
              <StackedArea
                data={datefilter(d.data)}
                xaccessor={d => d.time}
                {layers}
                bind:stacked_data={stack}
                {xScale}
                {yScale}
              />
              <Cursor {xScale} {yScale} let:x let:y let:sx let:sy>
                <VertCursor {x} />
                <!-- <BoxCursor {x} content={content(sx)} /> -->
              </Cursor>
            </LineGraph>
          </div>
          <div class="col-md-3">
            <ChartPrinter filename={'monthchart'} svg={monthsvg} />
          </div>
        </div>
        <div class="row box">
          <div class="col-md-9">
            <LineGraph
              xtime={true}
              width={800}
              ysuppressZero={false}
              intercepts={'bottom_left'}
              bind:svg={aggregatesvg}
              let:xScale
              let:yScale
            >
              <StackedArea data={d.aggregate} xaccessor={d => d.time} {layers} {xScale} {yScale} />
              <Cursor {xScale} {yScale} let:x let:y let:sx let:sy>
                <VertCursor {x} />
                <!-- <BoxCursor {x} content = {content(sx)}></BoxCursor> -->
              </Cursor>
            </LineGraph>
          </div>
          <div class="col-md-3">
            <ChartPrinter filename={'monthchart'} svg={aggregatesvg} />
          </div>
        </div>
      {/await}
      <!-- {/if} -->
    </div>
  </div>
</section>

<style type="text/scss">
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
