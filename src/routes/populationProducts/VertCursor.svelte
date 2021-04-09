<script>
  import { getContext } from 'svelte'
  export let x = 0

  const constants = getContext('constants')
  $: height = $constants.height
  $: margin = $constants.margin
</script>

<g>
  <line x1={x} x2={x} y1={0} y2={height - (margin.top + margin.bottom)} />
</g>

<style type="text/scss">
  line {
    stroke: black;
  }
</style>
