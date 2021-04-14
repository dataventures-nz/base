<script>
  import { onMount } from 'svelte'
  import { writable } from 'svelte/store'
  import { mappable_fields, time_fields } from '$lib/_utils/schemautils.js'
  import LineGraph from '$lib/charts/linegraph/LineGraph.svelte'
  import StackedArea from '$lib/charts/linegraph/StackedArea.svelte'
  import { population_before, population_between } from './product.js'
  import QueryMap from './QueryMap.svelte'
  import Cursor from '$lib/charts/linegraph/Cursor.svelte'
  import VertCursor from './VertCursor.svelte'
  import BoxCursor from './BoxCursor.svelte'
  import DatePicker from '$lib/datepicker/DatePicker.svelte'
  import DateSlider from '$lib/datepicker/DateSlider.svelte'
  import { query, getSchema, extents } from '$lib/api.js'
  import ChartPrinter from '$lib/charts/ChartPrinter.svelte'
  import * as d3 from 'd3'
  import * as df from 'date-fns'
  import Crossfilter from '$lib/query/Crossfilter.svelte'
  import Filter from '$lib/query/Filter.svelte'
  import { timeparse } from '$lib/_utils/utils.js'

  let mode = population_before

  let filename = 'graph'
  let datefield = 'time'
  let layerlist
  let table = 'hourly_materialised'
  let startDate = new Date(2020, 4, 18)
  let endDate = new Date(2020, 5, 1)
  let currentlayer = 0
  let dbfield = ''
  const db = 'population'
  let y1 = 2000
  let yearIndex1 = 0
  let yearIndex2 = 1
  let alignWeekdays = false
  let weekdayOffset = 0
  const selection = writable([])

  let mapLayerPromise = getSchema(`&${db}/${table}`)
    .then(d => mappable_fields(d))
    .then(d => {
      layerlist = d
    })

  async function getyears() {
    let now = new Date().getFullYear()
    let startquery = [{ $sort: { time: 1 } }, { $limit: 1 }, { $project: { time: 1 } }]
    let s = await query('population', table, startquery).then(d => new Date(d[0].time))
    y1 = s.getFullYear()
    let n = now - y1
    return Array(n + 1)
      .fill()
      .map((d, i) => i + y1)
  }

  let gotyears
  let myextents = new Promise(() => {})
  onMount(() => {
    gotyears = getyears()
    myextents = extents(db, table, 'time')
    // console.log(extents(db,table,"time"))
  })

  function make_match() {
    const group = {
      _id: '$time',
      time: { $first: '$time' },
      count: { $sum: '$count' },
      local: { $sum: '$local' },
      domestic: { $sum: '$domestic' },
      international: { $sum: '$international' },
      unknown: { $sum: '$unknown' }
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
    const pipeline = [{ $group: group }, { $project: projection }]
    return pipeline
  }

  function clean(data) {
    data.forEach(function (d) {
      d.Total = +d.count
      d.Domestic = +d.domestic
      d.International = +d.international
      d.Local = +d.local
      d.Unknown = +d.unknown 
      d.time = timeparse(d.time)
    })
    data.sort((a, b) => a.time - b.time)
    return data
  }

  $: dbfield = layerlist?.[currentlayer]?.db?.field ?? ''

  // $: if (mode && layerlist?.[currentlayer]?.map?.selection){
  //   selection = JSON.parse(JSON.stringify(layerlist[currentlayer].map.selection))
  // }

  $: s1 = new Date(new Date(startDate).setFullYear(yearIndex1 + y1))
  $: s2 = new Date(new Date(startDate).setFullYear(yearIndex2 + y1))

  $: weekdayOffset = s1.getDay() - s2.getDay()
  $: period = df.differenceInDays(endDate, startDate)

  let layers = [
    {
      name: 'Local',
      accessor: d => (d.mean ? d.mean('Local') : d.Local),
      style: { fill: '#5F93DC', stroke: 'none' },
      active: true
    },
    {
      name: 'Domestic',
      accessor: d => (d.mean ? d.mean('Domestic') : d.Domestic),
      style: { fill: '#ca637f', stroke: 'none' },
      active: true
    },
    {
      name: 'International',
      accessor: d => (d.mean ? d.mean('International') : d.International),
      style: { fill: '#F5BC61' },
      active: true
    },
    {
      name: 'Unknown',
      accessor: d => (d.mean ? d.mean('Unknown') : d.Unknown),
      style: { fill: '#ccc' },
      active: true
    }
  ]

  let stack1
  let stack2

  function syncSelection(e) {
    layerlist[currentlayer].map.selection = $selection
    if (e) {
      currentlayer = +e.target.value
      $selection = layerlist[currentlayer].map.selection
    }
  }

  function content(sx, stack) {
    if (stack?.length) {
      let m = d3.minIndex(stack[0], d => Math.abs(d.data.time - sx))
      if (stack[0][m]) {
        let d = stack[0][m]['data']
        return [
          'time: ' + df.format(d.time, 'haaa, ccc do MMM Y'),
          'total: ' + d.count,
          'visitors: ' + (d.domestic * 1 + d.international * 1 + d.unknown * 1)
        ]
      } else {
        return ['something else is wrong']
      }
    }
    return ['no stack']
  }

  let chartbox
  let width = 0
  $: console.log({ mode, $selection })

  import { createScale } from '$lib/charts/scaleStore.js'
  let externalYscale = createScale()
  externalYscale.setRange([170, 30])
  externalYscale.setExtents('exdomain', [0])
  let axisLocked = false
  $: if (selection.length == 0) {
    externalYscale.clear()
    externalYscale.setExtents('exdomain', [0])
  }

  let svg1, svg2
</script>

<Crossfilter {db} collection={table}>
  <Filter useMatches={false} brush={mode.commonFilter($selection, dbfield, df.add(startDate,{hours:12}), df.add(endDate,{hours:12}))} />
  <section class="container-fluid select-wrapper">
    <div class="row">
      <div class="col-md-12">
        <div class="box">
          some tabby thingies to choose between before and between
          <input
            type="radio"
            id={'before'}
            checked={mode.population_before}
            name="explorer"
            value={'before'}
            on:click={() => {
              mode = population_before
              mode.switch(startDate, endDate, selection)
              syncSelection()
            }}
          />
          <label for={'before'}>Before</label>
          <input
            type="radio"
            id={'between'}
            checked={mode.population_between}
            name="explorer"
            value={'between'}
            on:click={() => {
              mode = population_between
              mode.switch(startDate, endDate, selection)
              syncSelection()
            }}
          />
          <label for={'between'}>Between</label>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-5">
        <div class="box">
          <p>Select an area</p>
          {#await mapLayerPromise}
            Waiting for map
          {:then maplayers}
            <QueryMap height="700" selectMode={mode.selectMode} bind:layerlist {selection} {currentlayer} />
          {/await}
        </div>
      </div>
      <div class="col-md-7">
        <div class="row">
          <div class="col-md-12">
            <div class="box">
              Pick a map layer for aggregation:
              {#await mapLayerPromise}
                waiting for layers
              {:then maplayers}
                <select
                  name="layer"
                  id="layer"
                  on:click={e => {
                    syncSelection(e)
                    mode.switch(startDate, endDate, selection)
                  }}
                >
                  {#each layerlist as layer, i}
                    <option id={layer.map.name} name="layer" selected={i == currentlayer} value={i}>
                      {layer.map.name}
                    </option>
                  {/each}
                </select>
              {/await}
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-5">
            <div class="box">
              <p>Filter by date</p>
              <div class="select control is-fullwidth">
                {#await myextents then extent}
                  <div class="flex">
                    <DatePicker
                      bind:selected={startDate}
                      format={mode.datePickerFormat}
                      isAllowed={date =>
                        date <= endDate && date >= mode.dateExtents(extent)[0] && date <= mode.dateExtents(extent)[1]}
                    />
                    <DatePicker
                      bind:selected={endDate}
                      format={mode.datePickerFormat}
                      isAllowed={date =>
                        date >= startDate && date >= mode.dateExtents(extent)[0] && date <= mode.dateExtents(extent)[1]}
                    />
                  </div>
                {/await}
              </div>
            </div>
          </div>
          <div class="col-md-7">
            <div class="box">
              <div id="key">
                {#each layers as layer}
                  <button
                    style={'background-color:' + (layer.active ? layer.style.fill : 'white') + ';color:black'}
                    on:click={() => (layer.active = !layer.active)}
                  >
                    {layer.name}
                  </button>
                {/each}
              </div>
            </div>
            <div class="flex">
              {#if mode.population_before}
                <div class="box">
                  <input
                    type="checkbox"
                    id="align"
                    name="align"
                    checked={alignWeekdays}
                    on:change={() => (alignWeekdays = !alignWeekdays)}
                  />
                  <label for="align">Align Day of Week</label>
                </div>
              {/if}
              <div class="box">
                <input
                  type="checkbox"
                  id="lock"
                  name="lock"
                  checked={axisLocked}
                  on:change={() => (axisLocked = !axisLocked)}
                />
                <label for="lock">Lock Y axes together</label>
              </div>
            </div>
          </div>
        </div>
        {#if mode.population_before}
          <div class="box">
            Showing {$selection.map(d => d.name).join(', ')}
          </div>
        {/if}
        <div class="box" bind:this={chartbox} bind:clientWidth={width}>
          <div>
            {#if mode.population_before && gotyears}
              {#await gotyears then years}
                <select name="year1" id="year1" on:change={e => (yearIndex1 = e.target.options.selectedIndex)}>
                  {#each years as yr, i}
                    <option value={i} selected={i == 0}>{yr}</option>
                  {/each}
                </select>
              {/await}
            {/if}
            {#if mode.population_between && $selection[0]}
              {$selection[0].name}
            {/if}
          </div>
          <Filter
            pipeline={make_match()}
            pre={mode.uniqueFilter(0)(dbfield, $selection, s1, s2, period, weekdayOffset, alignWeekdays)}
            let:data
            process={clean}
            active={!!$selection.length}
          >
            {#if $selection[0]}
              <div>
                <LineGraph
                  xtime={true}
                  {width}
                  bind:svg={svg1}
                  ysuppressZero={false}
                  externalYscale={axisLocked ? externalYscale : null}
                  intercepts={'bottom_left'}
                  let:xScale
                  let:yScale
                >
                  {#await data then _data}
                    <StackedArea
                      data={_data}
                      {xScale}
                      {yScale}
                      xaccessor={d => d.time}
                      {layers}
                      bind:stacked_data={stack1}
                    />
                    <Cursor {xScale} {yScale} let:x let:y let:sx let:sy>
                      <VertCursor {x} />
                      <BoxCursor {x} content={content(sx, stack1)} />
                    </Cursor>
                  {/await}
                </LineGraph>
                <ChartPrinter svg={svg1} />
              </div>
            {/if}
          </Filter>
        </div>
        <div class="box">
          <div>
            {#if mode.population_before && gotyears}
              {#await gotyears then years}
                <select name="year2" id="year2" on:change={e => (yearIndex2 = e.target.options.selectedIndex)}>
                  {#each years as yr, i}
                    <option value={i} selected={i == 1}>{yr}</option>
                  {/each}
                </select>
              {/await}
            {/if}
            {#if mode.population_between && $selection[1]}
              {$selection[1].name}
            {/if}
          </div>
          <Filter
            pipeline={make_match()}
            pre={mode.uniqueFilter(1)(dbfield, $selection, s1, s2, period, weekdayOffset, alignWeekdays)}
            let:data
            process={clean}
            active={!!$selection.length}
          >
            {#if (mode.population_between && $selection[1]) || (mode.population_before && $selection[0])}
              <div>
                <LineGraph
                  xtime={true}
                  {width}
                  bind:svg={svg2}
                  ysuppressZero={false}
                  externalYscale={axisLocked ? externalYscale : null}
                  intercepts={'bottom_left'}
                  let:xScale
                  let:yScale
                >
                  {#await data then _data}
                    <StackedArea
                      data={_data}
                      {xScale}
                      {yScale}
                      xaccessor={d => d.time}
                      {layers}
                      bind:stacked_data={stack2}
                    />
                    <Cursor {xScale} {yScale} let:x let:y let:sx let:sy>
                      <VertCursor {x} />
                      <BoxCursor {x} content={content(sx, stack2)} />
                    </Cursor>
                  {/await}
                </LineGraph>
                <ChartPrinter svg={svg2} />
              </div>
            {/if}
          </Filter>
        </div>
        <div class="box">
          {#await myextents then extent}
            <DateSlider
              bind:start={startDate}
              bind:end={endDate}
              extent={mode.dateExtents(extent)}
              {width}
              format={mode.dateSliderFormat}
            />
          {/await}
        </div>
      </div>
    </div>
  </section>
</Crossfilter>

<style lang="scss">
  input {
    cursor: pointer;
    display: inline-block;
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
    flex-wrap: nowrap;
  }
  #key {
    display: flex;
    flex-direction: row;
    button {
      flex-grow: 1;
      padding: unset;
      height: 35px;
    }
  }
</style>
