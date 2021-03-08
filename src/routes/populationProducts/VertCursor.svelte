<script>
  import * as d3 from "d3";
  import { getContext } from 'svelte';
  export let x  = 0
  export let y  = 0
  export let data=[{x:0,y1:0.3,y2:0.7},{x:1,y1:0.7,y2:0.3}]
  export let xaccessor = d => d.x
  
  const constants=  getContext("constants")  
  $: height = $constants.height
  $: margin = $constants.margin

</script>

<style type="text/scss">
  line{
    stroke:black
}
</style>

<g>
  <line x1={x} x2={x} y1={0} y2={height-(margin.top+margin.bottom)}  ></line>
</g>