<script>
import * as d3 from 'd3'
import _ from 'lodash'
import PolarGraph from '$components/charts/PolarGraph.svelte'
import {single_only} from '$components/map/select_modes.mjs'
import QueryMap from './QueryMap.svelte'
import default_layerlist from "./field_to_layer.json"
import DatePicker from '$components/datepicker/DatePicker.svelte';
import ColorPicker from '$components/ToggledColorPicker.svelte';
import {query} from '$components/api.mjs'
import ChartPrinter from '$components/charts/ChartPrinter.svelte'

let filename = "polargraph"
let datefield = "time"
let table = "hourly_materialised"
let startDate = new Date(2020,0,1)
let endDate = new Date(2020,10,1)
let layerlist = default_layerlist
let allowedlayers = ["sa2_2018_code"]
let match
let currentlayer = 0
let selection = []
let dbfield = ""


function make_match(selection,dbfield,datefield,startDate,endDate){
  let newmatch = {}
  if (dbfield && selection.length){
    const idlist = selection.map(d=>+d.area_id)
    newmatch[dbfield] = {$in:idlist}
  }

  if(datefield && (startDate || endDate)){
    newmatch[datefield]= {}
    if (startDate) {newmatch[datefield].$gte = startDate}
    if (endDate) {newmatch[datefield].$lt = endDate}  
  }

  const projection = {_id:false,time:true,count:true}
  const pipeline = [{$match:newmatch},{$project:projection}]

  return pipeline
}

function clean(data){
  data.map(function(d){
    console.log(d.time, new Date(d.time), d.count)
    d.time = new Date(d.time)
    d.r = +d.count
    d.theta = d.time.getDay()+d.time.getHours()/24
  })
  data.sort((a,b)=>a.time-b.time)
  console.log(data[0])
  return data
}

let plotRadius = 300

let options ={
  plotRadius,
  labelAccessor : d=>d.time,
  thetaMax : 7,
  showPoints:true,
  axisTitles: new Array(7).fill(""),
  arcOptions:{
    labels:new Array(14).fill(""),
    inner:0.85*plotRadius,
    outer:0.9*plotRadius,
    offset:-0.5
  }
}

$: dbfield = layerlist[currentlayer].db.field
$: selection = layerlist[currentlayer].map.selection
$: match = make_match(selection,dbfield,datefield,startDate,endDate)


let data
let svg
let width
function plot(){data = query("population",table,match).then(clean)}
let chartdiv
$: if (chartdiv){width=(chartdiv.getBoundingClientRect().width)-12}

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
   	<div class="col-md-5">
      <div class=box>
        <!-- <Clear clearfn = {cleardateselection}></Clear> -->
        <div class = "columns select-wrapper">
          <div class = column>
            <p> Filter by date</p>
            <div class="select control is-fullwidth">
              <div class = flex>
                <DatePicker bind:selected = {startDate} isAllowed={(date)=>date<=endDate}/>
                <DatePicker bind:selected = {endDate} isAllowed={(date)=>date>=startDate}/>
              </div>
              <div>
                <button on:click={plot}> Plot </button>
              </div>
            </div>
          </div>
        </div>
        <div class = "columns select-wrapper">
          <div class = column>
          </div>
        </div>
      </div>
      <div class=box>
        <p>Select an area</p>
        <div>
          <QueryMap height = 700 selectMode={single_only} {allowedlayers} bind:layerlist currentlayer={0} ></QueryMap>
        </div>
      </div>
		</div>
   	<div class="col-md-7">
      <div class="box">
        <div class = "flex" id="numbers">
          <!-- <input type="number" step = 0.05 min=0.05 max=0.95 bind:value={x_position} />
          <input type="number" step = 0.05 min = -1 max =1 bind:value={y_position} /> -->
          <!-- <input type="number" step = 0.05 min=0.05 max=1 bind:value={plotwidth} />
          <input type="number" step = 0.05 bind:value={brokenaxis} />
          <input type="number" step = 0.05 min = 0.05 max = 1 bind:value={opacity} /> -->
        </div>
        <div class = "flex">
          <!-- <ColorPicker bind:toggle={closed} bind:color={stroke} label=Closed/>
          {#if closed}
            <ColorPicker bind:toggle={filled} bind:color={fill} label=Filled/>
          {/if}
          <ColorPicker bind:toggle={hasbackground} bind:color={background} label=Background/> 
         -->
          <div style = "padding:5px">
            <label for="filename">Filename</label>
            <input type="text" placeholder ="polargraph" bind:value={filename} />
          </div> 
        </div>
      </div>
      <div class=box bind:this={chartdiv}>
        {#if data}
          {#await data}
            waiting for data
          {:then d} 
            <PolarGraph data = {d} bind:svg={svg} {...options}/>
          {/await}
        {/if}
        
      </div>
      <div>
        <ChartPrinter filename={"myfile"} svg={svg} />
      </div>
		</div>
	</div>
</section>

