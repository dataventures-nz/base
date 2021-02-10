<script>
import Cursor from '$components/charts/linegraph/Cursor.svelte'
import LineGraph from '$components/charts/linegraph/LineGraph.svelte'
import LineTrace from '../../components/charts/linegraph/LineTrace.svelte'
import StackedArea from '../../components/charts/linegraph/StackedArea.svelte'
import { xor_only } from '$components/map/select_modes.mjs'
import QueryMap from './QueryMap.svelte'
import TNZCursor from './TNZCursor.svelte'
import default_layerlist from "./field_to_layer.json"
import DatePicker from '$components/datepicker/DatePicker.svelte'
import {query} from '$components/api.mjs'
import ChartPrinter from '$components/charts/ChartPrinter.svelte'
import { onDestroy } from 'svelte'

let filename = "graph"
let datefield = "time"
let table = "hourly_materialised"
let startDate = new Date(2020,3,1)
let endDate = new Date(2020,5,1)
let layerlist = default_layerlist
let allowedlayers = ["sa2_2018_code"]
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

  const projection = {_id:false,time:true,count:true,local:true,domestic:true,international:true,unknown:true}
  const pipeline = [{$match:newmatch},{$project:projection}]
  // const pipeline = [{$match:newmatch}]

  return pipeline
}

function clean(data){
  data.map(function(d){
    d.time = new Date(d.time)
    d.r = +d.count
    d.theta = d.time.getDay()+d.time.getHours()/24
  })
  data.sort((a,b)=>a.time-b.time)
  return data
}

let dataarrays = {}

function addtodataarrays(selection){
  const match = make_match([selection],dbfield,datefield,startDate,endDate)
  const data = query("population",table,match).then(clean)
  return {selection,data,color:"#" + Math.floor(Math.random()*16777215).toString(16)}
}

$: dbfield = layerlist[currentlayer].db.field
$: if (selection){
  selection = JSON.parse(JSON.stringify(layerlist[currentlayer].map.selection))
  let newdataarrays = {} 
  selection.map(function(s){newdataarrays[s.name]=dataarrays[s.name]||addtodataarrays(s)})
  dataarrays = newdataarrays
}

let data2 = [{x:0,y:0},{x:0.5,y:1},{x:1,y:0}]

let svg
let width
let chartdiv
$: if (chartdiv){width=(chartdiv.getBoundingClientRect().width)-12}

const i1 = [0.5,0.8]
const i2="zero"
const i3 = [new Date(2020,3,1),0]

let layers = [
    {
      name:"y1",
      accessor: d => +d.local,
      style:{fill:"pink",stroke:"black","fill-opacity":0.5}
    },
    {
      name:"y2",
      accessor: d => +d.domestic,
      style:{fill:"yellow",stroke:"yellow"}
    },
    {
      name:"y2",
      accessor: d => +d.international,
      style:{fill:"#000","fill-opacity":0.1}
    },
    {
      name:"y2",
      accessor: d => +d.unknown,
      style:{fill:"green",stroke:null}
    }
  ]

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

</style>

<section class = "container-fluid select-wrapper">
 	<div class="row">
   	<div class="col-md-5">
      <div class=box>
        <div class = "columns select-wrapper">
          <div class = column>
            <p> Filter by date</p>
            <div class="select control is-fullwidth">
              <div class = flex>
                <DatePicker bind:selected = {startDate} isAllowed={(date)=>date<=endDate}/>
                <DatePicker bind:selected = {endDate} isAllowed={(date)=>date>=startDate}/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class=box>
        <p>Select an area</p>
          <QueryMap height = 700 selectMode={xor_only} {allowedlayers} bind:layerlist currentlayer={0} ></QueryMap>
      </div>
		</div>
   	<div class="col-md-7">
      <div class="box">
        <div class = flex style = "padding:5px">         
          <label for="filename">Filename</label>
          <input type="text" placeholder ="polargraph" bind:value={filename} />
          <ChartPrinter filename={filename} svg={svg} />
        </div>
      </div>
      <div class="row box">
        <div class="col-md-12" bind:this={chartdiv}>
          <LineGraph  yextent = {[-2,2]} intercepts = {"zero"}>
            <LineTrace stroke="red" data ={[{x:-3,y:0},{x:3,y:1}]}></LineTrace>
            <LineTrace data ={[{x:0.0,y:-0.5},{x:5,y:3}]}></LineTrace>
            <LineTrace data ={[{x:0,y:0},{x:7,y:2}]}></LineTrace>
            <LineTrace data ={data2} ></LineTrace>
          </LineGraph>
        </div>
      </div>
      <div class="row box">
        <div class="col-md-12">
          <LineGraph xtime={true} width = {800} ysuppressZero={false} intercepts = {"bottom_left"}>
            {#if dataarrays}
              {#each Object.values(dataarrays) as dataarray,i}
                {#await dataarray.data then d} 
                  <LineTrace data = {d} xaccessor={d=>d.time} yaccessor={d=>+d.count}></LineTrace>
                {/await}
              {/each}   
            {/if}
          </LineGraph>
        </div>
      </div>
      <div class="row box">
        <div class="col-md-12">
          <LineGraph xtime={true} width = {800} ysuppressZero={false} intercepts = {"bottom_left"}>
            {#if Object.values(dataarrays)[0]}
              {#await Object.values(dataarrays)[0].data then d}
                <StackedArea data = {d} xaccessor={d=>d.time} {layers}></StackedArea>
                <LineTrace data = {d} xaccessor={d=>d.time} yaccessor={d=>+d.domestic+(+d.unknown)} stroke={"black"}></LineTrace> 
              {/await}
            {/if}
            <Cursor let:x let:y let:sx let:sy>
              <g style = {"transform:translate("+x+"px,"+y+"px)"}> 
                <text>{sx}</text>
              </g>
              <TNZCursor {x} ></TNZCursor>
            </Cursor>
          </LineGraph>
        </div>
      </div>
		</div>
	</div>
</section>