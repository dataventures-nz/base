<script>

import * as d3 from "d3";
import picsaver from 'save-svg-as-png'
  export let groups
  
  export let height = 800
  export let width = 1600
  export let position = [0.3,0.2]
  export let plotwidth = 0.2
  export let xdomain =[0,1]
  export let ydomain =[0,1]
  export let yextent =[0,1] 
  export let yaccessor = d=>+d.y
  export let xaccessor = d=>d.offset
  export let line_only = false
  export let stroke = (d,i)=>"black"
  export let fill = (d,i)=>"black"
  export let fillOpacity = (d,i)=>1

  let options
  $: options = {height,width,xdomain,ydomain,yextent,yaccessor,xaccessor}

  let yscale = d3.scaleLinear()
  let xscale = d3.scaleLinear()
  
  const area = d3.area()
    .x((d)=>xscale(options.xaccessor(d)))
    .y0(d=>yscale(options.yaccessor(d)))
    .y1(d=>yscale(0))

  const line = d3.line()
    .x((d)=>xscale(options.xaccessor(d)))
    .y(d=>yscale(options.yaccessor(d)))
    
  let lines 
  $: lines = Object.values(groups).map(d=>d.data)

let mousedown = false
let mousep = {
  x1:0,
  x2:0,
  y1:0,
  y2:0,
  dx: function(){return this.x2-this.x1},
  dy: function(){return this.y2-this.y1}
}

const dragstart = (e)=>{
  mousedown = true
  mousep.x1 = e.clientX
  mousep.x2 = e.clientX
  mousep.y1 = e.clientY
  mousep.y2 = e.clientY
}

const drag = (e)=>{
  if(mousedown){
    mousep.x2 = e.clientX
    mousep.y2 = e.clientY
  }
}

const dragend = (e)=>{mousedown = false}

let dx,dy,y1

let svg

$: {yscale.domain(options.ydomain).range([options.height*position[0],0])
    area
      .y0(d=>yscale(options.yaccessor(d)))
      .y1(d=>yscale(0))
    line
      .y(d=>yscale(options.yaccessor(d)))
    }
$: {xscale.domain(options.xdomain).range([0,width*plotwidth])
    area.x((d)=>xscale(options.xaccessor(d)))
    line.x((d)=>xscale(options.xaccessor(d)))
    }
$: dx = mousep.dx()/lines.length
$: dy = mousep.dy()/lines.length
$: y1 = yscale(options.yextent[1]-options.yextent[0])



const savesvg = ()=> picsaver.saveSvg(svg,"mysvg.svg",{excludeUnusedCss:true}) 
const savewithoutcss = ()=> picsaver.saveSvg(svg,"mysvg.svg",{excludeCss:true})
const savepng = ()=> picsaver.saveSvgAsPng(svg,"mypng.png",{backgroundColor:"white"})  



// hand over a data structure consisting of an object where each entry is an array
</script>

<style>
  svg{
    border:black
    }
</style>

<svg height={options.height} width={options.width} bind:this={svg} on:mousedown={dragstart} on:mousemove={drag} on:mouseup={dragend}>
  {#each lines as d,i}
    <g transform="translate({options.width*position[1]+dx*i},{y1+dy*i})" >
      {#if line_only}
       <path fill = none stroke={stroke(d,i)}  d={line(d)}></path>
      {:else}
        <path fill={fill(d,i)} fill-opacity={fillOpacity(d,i)} stroke={stroke(d,i)} d={area(d)}></path>
      {/if}    
    </g>
  {/each}
</svg>
<button on:click = {savesvg}>gimme</button>
<button on:click = {savewithoutcss}>no css</button>
<button on:click = {savepng}>png</button>