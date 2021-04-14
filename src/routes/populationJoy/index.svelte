<script>
  import * as d3 from 'd3'
  import WaterfallGraph from '$lib/charts/WaterfallGraph.svelte'
  import ColorPicker from '$lib/ToggledColorPicker.svelte'
  import { onMount } from 'svelte'

  let filename = 'waterfall'

  let opacity = 0.3 //= d3.scaleLinear().domain([0,16]).range([0.2,0.7])

  let chunkPostProcess = function (d) {
    let leftclone = JSON.parse(JSON.stringify(d[0]))
    let rightclone = JSON.parse(JSON.stringify(d[d.length - 1]))
    leftclone.left = leftclone.left - 10000
    leftclone.Dec1Count = 0
    leftclone.NYECount = 0
    rightclone.left = rightclone.left + 10000
    rightclone.Dec1Count = 0
    rightclone.NYECount = 0
    d.unshift(leftclone)
    d.push(rightclone)
  }

  let options = {
    // yaccessor: d=>+d.NYECount,
    // yaccessor: d=>+d.Dec1Count,
    // yaccessor: d=>d.NYECount?Math.log2(+d.NYECount):0,
    yaccessor: d => (+d.NYECount && +d.Dec1Count ? Math.min(+d.NYECount / +d.Dec1Count, 8) : 0),
    xaccessor: d => +d.left,
    zaccessor: d => +d.top
  }

  let d

  // onMount(()=>d=d3.csv("/data/griddeddata.csv").then(clean))
  // onMount(()=>d=d3.csv("/data/grid10x50.csv").then(clean))
  onMount(() => (d = d3.csv('/data/grid10x20.csv').then(clean)))

  let width

  let brokenaxis = 0
  let position
  let x_position = 0.05 //fraction of height
  let y_position = 0.2 //fraction of width
  let plotwidth = 0.5 //fraction of width
  let dx = 0
  let dy = 720
  let stroke = '#000000'
  let fill = '#ffffff'
  let background = '#eeeeee'
  let filled = false
  let closed = false
  let hasbackground = false

  function clean(rawdata) {
    let _groups = {}

    let data = rawdata.filter(d => d.NYECount)
    data.sort((a, b) => b.top - a.top)
    options.yextent = d3.extent(data, options.yaccessor)
    options.ydomain = options.yextent
    options.xdomain = d3.extent(data, options.xaccessor)
    data.map(function (d) {
      d.top = +d.top
      d.left = +d.left
      if (_groups[d.top]) {
        _groups[d.top].data.push(d)
      } else {
        _groups[d.top] = { data: [d] }
      }
    })
    return _groups
  }

  $: position = [x_position, y_position]

  let overline = false
  $: data = d
  let chartdiv
  $: if (chartdiv) {
    width = chartdiv.getBoundingClientRect().width - 20
  }
  $: console.log({ width })
  // width = 400
</script>

<section class="container-fluid select-wrapper">
  <div class="row">
    <div class="col-md-3">
      <div class="box">
        <div class="flex" id="numbers">
          <input type="number" step="0.05" min="0.05" max="0.95" bind:value={x_position} />
          <input type="number" step="0.05" min="-1" max="1" bind:value={y_position} />
          <input type="number" step="0.05" min="0.05" max="1" bind:value={plotwidth} />
          <input type="number" step="0.05" bind:value={brokenaxis} />
          <input type="number" step="0.05" min="0.05" max="1" bind:value={opacity} />
          <input type="number" step="1" bind:value={dx} />
          <input type="number" step="10" bind:value={dy} />
        </div>

        <div class="flex">
          <ColorPicker bind:toggle={closed} bind:color={stroke} label="Closed" />
          {#if closed}
            <ColorPicker bind:toggle={filled} bind:color={fill} label="Filled" />
          {/if}
          <ColorPicker bind:toggle={hasbackground} bind:color={background} label="Background" />
          <input type="checkbox" id="overline" bind:checked={overline} />
          <label for="overline">Overline only</label>
        </div>
        <div>
          <div style="padding:5px">
            <label for="filename">Filename</label>
            <input type="text" placeholder="waterfall" bind:value={filename} />
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-9">
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
              bind:dx
              bind:dy
              usemouse={false}
              {filename}
              stroke={(d, i) => stroke}
              fill={(d, i) => fill}
              fillOpacity={(d, i) => opacity}
              {closed}
              {filled}
              {background}
              {hasbackground}
              {width}
              height={(width * 420) / 700}
              {...options}
              {chunkPostProcess}
              curve={d3.curveCardinal.tension(0)}
              {overline}
            />
          {/await}
        {/if}
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

  #numbers input {
    width: 17%;
  }
</style>
