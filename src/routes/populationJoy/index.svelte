<script>
import * as d3 from 'd3'
import _ from 'lodash'
import WaterfallGraph from '$components/charts/WaterfallGraph.svelte'
import ColorPicker from '$components/ToggledColorPicker.svelte';
import { onMount } from 'svelte'

let filename = "waterfall"

let opacity = 0.3//= d3.scaleLinear().domain([0,16]).range([0.2,0.7])

let options={
  yaccessor: d=>+d.NYECount,
  // yaccessor: d=>+d.Dec1Count,
  // yaccessor: d=>d.NYECount?Math.log2(+d.NYECount):0,
  // yaccessor: d=> (+d.NYECount && +d.Dec1Count)? +d.NYECount/+d.Dec1Count : 0,
  xaccessor: d=>+d.left,
  zaccessor : d=>+d.top
}

let d

// onMount(()=>d=d3.csv("/data/griddeddata.csv").then(clean))
// onMount(()=>d=d3.csv("/data/grid10x50.csv").then(clean))
onMount(()=>d=d3.csv("/data/grid10x20.csv").then(clean))

let height
let width 

let brokenaxis=0
let position
let x_position=0.25 //fraction of height
let y_position = 0.05 //fraction of width
let plotwidth=0.5 //fraction of width
let stroke="#000000"
let fill="#ffffff"
let background = "#eeeeee"
let filled = false
let closed = false
let hasbackground = false

function clean(rawdata){
  let groups ={}
  let _groups = {}
  
  let data = rawdata.filter(d=>d.NYECount)
  console.log({rawdata,data})
  data.sort((a,b)=>b.top-a.top)
  options.yextent=d3.extent(data,options.yaccessor)
  options.ydomain=options.yextent
  options.xdomain=d3.extent(data,options.xaccessor)
  console.log({options})

  

  data.map(function(d){
    d.top=+d.top
    d.left=+d.left
    if(_groups[d.top]){_groups[d.top].data.push(d)} else {_groups[d.top]={data:[d]}}
  })

  //  let _values = Object.values(_groups)
  //  _groups = Object.entries(_groups) 
  

  // let gmax = _values.sort((a,b)=>b.data.length - a.data.length)[1]

  // _groups.map(d=>{
  //   // if(d[1].data.length >= gmax.data.length){groups[d[0]] = d[1]} 
  // })

  return _groups
}

$: position = [x_position,y_position]

let dx
let dy

$: data = d
let chartdiv
$: if (chartdiv){width=(chartdiv.getBoundingClientRect().width)-20}
$: console.log({width})
// width = 400
</script>

<style type="text/scss">
	button{
		width:100%
	}

	input {
    cursor: pointer;
    display: block;
    font-size: 1em;
    max-width: 100%;
    outline: thin;
	}

  .box{
    position:relative;
    border: 1px solid black;
    padding: 5px;
    margin:5px;
  }

  .flex{
    display: flex;
    flex-direction: row;
    align-items: stretch;
    flex-wrap:wrap
  }

  #numbers input{
    width:17%
    }

</style>

<section class = "container-fluid select-wrapper">
 	<div class="row">
   	<div class="col-md-3">
      <div class="box">
        <div class = "flex" id="numbers">
          <input type="number" step = 0.05 min=0.05 max=0.95 bind:value={x_position} />
          <input type="number" step = 0.05 min = -1 max =1 bind:value={y_position} />
          <input type="number" step = 0.05 min=0.05 max=1 bind:value={plotwidth} />
          <input type="number" step = 0.05 bind:value={brokenaxis} />
          <input type="number" step = 0.05 min = 0.05 max = 1 bind:value={opacity} />
          <input type="number" step = 1 bind:value={dx} />
          <input type="number" step = 1 bind:value={dy} />
        </div>
      
        <div class = "flex">
          <ColorPicker bind:toggle={closed} bind:color={stroke} label=Closed/>
          {#if closed}
            <ColorPicker bind:toggle={filled} bind:color={fill} label=Filled/>
          {/if}
          <ColorPicker bind:toggle={hasbackground} bind:color={background} label=Background/> 
        
          <div style = "padding:5px">
            <label for="filename">Filename</label>
            <input type="text" placeholder ="waterfall" bind:value={filename} />
          </div> 
        </div>
      </div>
    </div>
    <div class="col-md-9">
      <div class=box bind:this={chartdiv}>
        {#if data}
          {#await data}
            {JSON.stringify(options)}
          {:then groups} 
            <WaterfallGraph groups={groups} 
              bind:position={position} 
              bind:plotwidth={plotwidth}
              bind:brokenaxis={brokenaxis}
              bind:dx={dx}
              bind:dy={dy}
              filename={filename}
              stroke={(d,i)=>stroke} 
              fill={(d,i)=>fill}
              fillOpacity={(d,i)=>opacity}
              closed={closed} 
              filled={filled}  
              background={background}
              hasbackground={hasbackground}
              width={width}
              height={width*420/700}    
              {...options}/>
          {/await}
        {/if}
        
      </div>
		</div>
	</div>
</section>

