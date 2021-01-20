<script>
  import { onDestroy } from 'svelte';
  import * as d3 from "d3";
  import { getContext } from 'svelte';
  export let data=[{x:0,y:0},{x:1,y:1}]
  export let stroke = undefined
  export let xaccessor = d => d.x
  export let yaccessor = d => d.y
  export let id = Math.random()
  // const {set_xExtents,set_yExtents, clear_Extents} = getContext("setExtents")


  $: if (stroke==undefined) {
    stroke = "#" + Math.floor(Math.random()*0xefffff + 0x100000).toString(16)
  }
  let {height,margin,xScale,yScale,xextent,yextent} =  getContext("constants");



  if(xextent){xScale.setExtents(id,xextent)} 
    else {xScale.setExtents(id,data.map(xaccessor))} 

  if(yextent){yScale.setExtents(id,yextent)} 
    else {yScale.setExtents(id,data.map(yaccessor))} 

  onDestroy(() => {xScale.clear(id);yScale.clear(id)})

  $: line = d3.line().x(d=>$xScale(xaccessor(d))).y(d=>$yScale(yaccessor(d)))

</script>

  <g style = {"transform:translate("+margin+","+margin+")"}>
      <path d={line(data)} style={"fill:none;stroke:"+stroke}></path>
  </g>