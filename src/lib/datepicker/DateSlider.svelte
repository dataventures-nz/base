<script>
  import * as d3 from 'd3'

  export let extent = [new Date(2020, 0, 1), new Date(2020, 1, 1)]
  export let start = new Date(2020, 0, 10)
  export let end = new Date(2020, 0, 15)
  export let format = null
  export let width = 1000
  let slider, axisnode

  let scale = d3.scaleTime()
  $: w = Math.max(width - 50, 1)
  $: if (width) {
    scale.range([50, w])
  }
  $: scale.domain(extent)

  function onbrush(e) {
    start = new Date(scale.invert(e.selection[0]))
    end = new Date(scale.invert(e.selection[1]))
  }

  let brush = d3
    .brushX()
    .extent([
      [50, 50],
      [w, 70]
    ]) //[[left,top][right,bottom]]
    .handleSize(3)
    .on('brush', onbrush)

  $: axis = d3.axisBottom(scale).tickFormat(format)

  $: {
    const selection = d3.select(slider)
    selection.call(brush)
    selection.selectAll('.handle').attr('fill', 'green')
    selection.select('.selection').attr('fill', 'green').attr('fill-opacity', 0.8).attr('stroke', 'none')
  }

  $: if (width) {
    const a = d3.select(axisnode)
    a.call(axis)
    brush.extent([
      [50, 50],
      [w, 70]
    ])
    d3.select(slider).call(brush)
    brush.move(d3.select(slider), [scale(start), scale(end)])
  }
</script>

<div id="slider_div">
  <svg height="100px" {width}>
    <rect fill="pink" height="20px" width={width - 100} transform="translate(50,50)" />
    <g bind:this={slider} />
    <g bind:this={axisnode} transform="translate(0,70)" />
  </svg>
</div>

<style type="text/scss">
</style>
