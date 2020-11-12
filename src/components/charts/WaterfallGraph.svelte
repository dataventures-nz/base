<script>
  import * as d3 from "d3";
  export let groups
  export let options

  const defaultoptions={
    height:800,
    width:1600,
    color:"black"
  }

   $: options = {...defaultoptions,...options}

  let yscale = d3.scaleLinear().domain(options.ydomain).range([options.height/2,0])
  let xscale = d3.scaleLinear().domain(options.xdomain).range([0,options.width/2])

  let line = d3.line()
    .x((d)=>xscale(options.xaccessor(d)))
    .y(d=>yscale(options.yaccessor(d)))

  let lines = Object.values(groups).map(d=>d.data)
  
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

$: dx = mousep.dx()/lines.length
$: dy = mousep.dy()/lines.length
$: y1 = yscale(options.yextent[1]-options.yextent[0])

$: console.log(options)

// hand over a data structure consisting of an object where each entry is an array
</script>

<style>
  path{
    fill:none;
    opacity:0.5;
  }
</style>

<svg height={options.height} width={options.width} on:mousedown={dragstart} on:mousemove={drag} on:mouseup={dragend}>
  {#each lines as d,i}
    <g transform="translate({options.width/20+dx*i},{y1+dy*i})" >
      <path stroke = {options.color} d={line(d)}></path>
    </g>
  {/each}
</svg>