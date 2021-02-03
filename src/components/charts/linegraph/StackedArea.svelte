<script>
  import { onDestroy } from 'svelte';
  import * as d3 from "d3";
  import { getContext } from 'svelte';
  export let id = "StackedArea"+Math.random()
  export let data=[{x:0,y1:0.3,y2:0.7},{x:1,y1:0.7,y2:0.3}]
  export let xaccessor = d => d.x
  export let layers = [
    {
      name:"y1",
      accessor: d => d.y1,
      style:{fill:"pink",stroke:"black","fill-opacity":0.5}
    },
    {
      name:"y2",
      accessor: d => d.y2,
      style:{fill:"pink",stroke:"black","fill-opacity":0.5}
    }
  ]

  console.log(data[0])

  let {height,margin,xScale,yScale,xextent,yextent} =  getContext("constants");

  $: if(xextent){xScale.setExtents(id,xextent)} 
    else {xScale.setExtents(id,data.map(xaccessor))}

  let stackaccessor = (d,key)=>layers[key].accessor(d)

  let stack = d3.stack().keys(Object.keys(layers)).value(stackaccessor)

  let area = d3.area()

  $: area.x(d=>$xScale(xaccessor(d.data)))
    .y1(d=>$yScale(d[1]))
    .y0(d=>$yScale(d[0]))

  var _stack = stack(data)
  var toplayer = _stack[_stack.length -1]

  $: if(yextent){yScale.setExtents(id,yextent)} 
    else {yScale.setExtents(id,toplayer.map(d=>d[1]))} 

  onDestroy(() => {xScale.clear(id);yScale.clear(id)})

</script>

<g style = {"transform:translate("+margin+","+margin+")"}>
  
  {#each _stack as a}
    <path d={area(a)} { ...layers[a.key].style }></path>
  {/each}
</g>