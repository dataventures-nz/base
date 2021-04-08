<script>
  import { getContext } from 'svelte'
  const constants = getContext('constants')
  export let xScale
  export let yScale
  $: height = $constants.height
  $: width = $constants.width
  $: margin = $constants.margin

  let sx = 0
  let sy = 0
  let x = 0
  let y = 0
  let e

  $: if (e) {
    let rect = e.target.getBoundingClientRect()
    x = e.clientX - rect.left
    y = e.clientY - rect.top
    sx = $xScale.invert(e.offsetX)
    sy = $yScale.invert(e.offsetY)
  }
</script>

<g style={'transform:translate(' + margin.left + 'px,' + margin.top + 'px)'}>
  <slot {x} {y} {sx} {sy} />
  <rect
    height={height - (margin.top + margin.bottom)}
    width={width - (margin.left + margin.right)}
    on:mousemove={event => (e = event)}
  />
</g>

<style type="text/scss">
  rect {
    fill-opacity: 0;
  }
</style>
