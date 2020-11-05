<script>
  // import { group } from "console";
  import * as d3 from "d3";
  // import Index from "../routes/Snowflake/index.svelte";
  export let data
  export let chartheight = 500
  export let options
  var defaultoptions = {
    margin:20,
    plotRadius : 200,
    closed : false,
    axisTitles: new Array(4).fill(""),
    axisOffset: 0,
    showPoints:true,
    label:false,
    arcs:false,
    path:{
      stroke:"black",
      fill:"none"
      },
    arcOptions:{  
        inner:0.95*options.plotRadius,
        outer:options.plotRadius,
        offset:0,
        labels:new Array(4).fill(""),
        fill:["lightgrey","darkgrey"],
        stroke:["lightgrey","darkgrey"]
      },
    labelAccessor: d=>d.label,
    pathId:0,
    gradient:false,
    gradientStops:[
      {stop:"0%",color:"white"},
      {stop:"50%",color:"#EE6823"},
      {stop:"100%",color:"black"},
    ]
  }

  defaultoptions.thetaMax = d3.max(data,d=>d.theta)
  defaultoptions.rMax = d3.max(data,d=>d.r)

  if (options.arcOptions) {
    options.arcOptions = {...defaultoptions.arcOptions,...options.arcOptions}
  }
  if (options.path) {
    options.path = {...defaultoptions.path,...options.path}
  }
  
  options = {...defaultoptions,...options}

  let rotAngle = 360/options.axisTitles.length
  let thetaScale = d3.scaleLinear().domain([0,options.thetaMax]).range([0,2*Math.PI])
  let rScale = d3.scaleLinear().domain([0,options.rMax]).range([0,options.plotRadius])
  let line = d3.lineRadial().angle(d=>thetaScale(d.theta)).radius(d=>rScale(d.r))
  let svgSize = options.plotRadius+options.margin

  function x(d) {return rScale(d.r)*Math.sin(thetaScale(d.theta))}
  function y(d) {return -1*rScale(d.r)*Math.cos(thetaScale(d.theta))}

  let arcPath = d3.arc().innerRadius(options.arcOptions.inner).outerRadius(options.arcOptions.outer)
  let arcAngle = 2*Math.PI/options.arcOptions.labels.length
  let arcs = options.arcOptions.labels.map((d,i)=>({
    startAngle:(i-options.arcOptions.offset)*arcAngle,
    endAngle:(i+1-options.arcOptions.offset)*arcAngle,
    label:d
  }))  

</script>

<style>
  svg{
      /* background-color: lemonchiffon; */
    }

   .hidden{
     /* visibility: hidden; */
     opacity: 0;
   }

   .hidden:hover{
     opacity:1;
   }
   .tooltip text{
     pointer-events: none;
   }
</style>

<svg width={chartheight} height={chartheight}>

  {#if options.gradient}
    <radialGradient
      id="gradient"
      gradientUnits = "userSpaceOnUse"
      cx=0
      cy=0
      r={options.plotRadius}>
      {#each options.gradientStops as {stop,color},i}
        <stop offset={stop} stop-color={color}></stop>
      {/each}
    </radialGradient>
  {/if}
  {#if options.arcs}
    {#each arcs as arc,i}
      <g class="arc" transform={"translate("+svgSize+","+svgSize+")"}>
        <path 
          d={arcPath(arc)}
          stroke={options.arcOptions.stroke[i%2]}
          fill={options.arcOptions.fill[i%2]}>
      </path>
      </g>  
    {/each}
  {/if}
  {#if options.axisTitles.length}
    {#each options.axisTitles as axis,i}
      <g class="axis" transform = {"translate("+svgSize+","+svgSize+") rotate("+(180+(i-options.axisOffset)*rotAngle)+")"}>
        <line x1=0 y1=0 x2=0 y2= {options.plotRadius} stroke="darkgrey"></line>
        <text text-anchor = "end" transform = {"translate(-12,"+(0.98*options.plotRadius)+") rotate(90)"}>{axis}</text>
      </g>
    {/each}
  {/if}
  <g transform = {"translate("+svgSize+","+svgSize+")"}>
    <!-- <path d={line(data)} stroke={options.stroke} fill={options.fill} opacity={options.opacity}></path> -->
    {#if options.gradient}
      <path d={line(data)} style="fill:none;stroke:url(#gradient)"></path>
    {:else}
      <path d={line(data)} {...options.path}></path>
    {/if}
  </g>
  {#if options.showPoints}
    {#each data as d,i}
      <g 
        class="tooltip" 
        class:hidden={!d.clicked}
        on:click={()=> d.clicked = !d.clicked}
        transform ={"translate("+(x(d)+svgSize)+","+(y(d)+svgSize)+")"}>
        <circle r=5 stroke = "black" fill="none" ></circle>
        <text>{options.labelAccessor(d)}</text>
      </g>
    {/each}
  {/if}
</svg>