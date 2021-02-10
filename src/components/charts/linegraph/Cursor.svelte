<script>
  import { getContext } from 'svelte';
  
  let {height,width,margin,xScale,yScale,xextent,yextent} =  getContext("constants");
  
  let sx = 0
  let sy = 0
  let x  = 0
  let y  = 0
  let e

  $: if(e){
    let rect = e.target.getBoundingClientRect();
    x = e.clientX - rect.left
    y = e.clientY - rect.top;
    sx = $xScale.invert(e.offsetX)
    sy = $yScale.invert(e.offsetY)
  }

</script>
<style type="text/scss">
  rect{
    fill-opacity:0
}
</style>

<g style = {"transform:translate("+margin+"px,"+margin+"px)"}>
  <slot {x}{y}{sx}{sy} ></slot>
  <rect height={height-(2*margin)} width={width-2*margin} on:mousemove={(event)=> e=event} ></rect>
</g>