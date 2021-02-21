<script>
import Cursor from '$components/charts/linegraph/Cursor.svelte'
import LineGraph from '$components/charts/linegraph/LineGraph.svelte'
import StackedArea from '../../components/charts/linegraph/StackedArea.svelte'
import { single_only } from '$components/map/select_modes.mjs'
import QueryMap from './QueryMap.svelte'
import VertCursor from './VertCursor.svelte'
import BoxCursor from './BoxCursor.svelte'
import DatePicker from '$components/datepicker/DatePicker.svelte'
import {query} from '$components/api.mjs'
import ChartPrinter from '$components/charts/ChartPrinter.svelte'
import * as d3 from "d3"
import * as df from "date-fns"


let filename = "graph"
let datefield = "time"
let collection = "noon_by_rto"
let month = df.addMonths(new Date(),-1)


let layerlist = [{
    "db":{
      "field":"RTO_code"
    },
    "map":{
      "name":"rto",
      "url":"mapbox://dataventures.clfbgxtb",
      "sourcelayer":"RTO2017-8gz3hf",
      "properties":{
        "id":"RTO2017_V1",
        "name":"RTO2017__1"
      },
      "selection":[]
    },
    "ui":{
      "visible":false,
      "include":false,
      "displayname":"RTO"
    }
  }]


let selection = []
let dbfield = ""

function make_match(selection,dbfield,datefield,month){
  let newmatch = {}
  if (dbfield && selection.length){
    const idlist = selection.map(d=>+d.area_id)
    newmatch[dbfield] = {$in:idlist}
  }

  if(datefield && month){
    newmatch[datefield]= {}
    if (month) {
      newmatch[datefield].$gte = df.startOfMonth(month)
      newmatch[datefield].$lt = df.endOfMonth(month)
    }  
  }

  const projection = {_id:false,time:true,count:true,local:true,domestic:true,international:true,unknown:true}
  const pipeline = [{$match:newmatch},{$project:projection}]

  return pipeline
}

function clean(data){
  data.map(function(d){
    d.time = new Date(d.time)
  })
  data.sort((a,b)=>a.time-b.time)
  return data
}

let dataarrays = {}

function addtodataarrays(selection){
  const match = make_match([selection],dbfield,datefield,month)
  console.log({match})
  const data = query("population",collection,match).then(clean)
  return {selection,data,color:"#" + Math.floor(Math.random()*16777215).toString(16)}
}

$: if (layerlist.length > 0){ dbfield = layerlist[0].db.field}

$: if (layerlist.length > 0 && selection){
  selection = JSON.parse(JSON.stringify(layerlist[0].map.selection))
  let newdataarrays = {} 
  selection.map(function(s){newdataarrays[s.name]=dataarrays[s.name]||addtodataarrays(s)})
  dataarrays = newdataarrays
}

$: console.log(make_match(selection,dbfield,datefield,month))
// $: console.log(selection)

let svg
let width
let chartdiv
$: if (chartdiv){width=(chartdiv.getBoundingClientRect().width)-12}


let layers = [
    {
      name:"y1",
      accessor: d => +d.local,
      style:{fill:"pink",stroke:"none","fill-opacity":0.5}
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
  let stack
  function content(sx){
    if (stack){
      
      let m = d3.minIndex(stack[1],d=>Math.abs(d.data.time-sx))
      
      if (stack[1][m]){
      let d = stack[1][m]["data"]
      return [
        df.format(d.time,"d MMM yyyy"),
        "total: "+d.count,
        "visitors: "+((d.domestic*1)+(d.international*1)+(d.unknown*1))
      ]
      } else {
        return ["something else is wrong"]
      }
    }
    return ["something is wrong"]
  }  


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
                <DatePicker showDays = {false} format={"MMMM yyyy"} bind:selected = {month}/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class=box>
        <p>Select an area</p>
          <QueryMap height = 700 selectMode={single_only} bind:layerlist currentlayer={0}></QueryMap>
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
        <div class="col-md-12">
          <LineGraph xtime={true} width = {800} ysuppressZero={false} intercepts = {"bottom_left"}>
            {#if Object.values(dataarrays)[0]}
              {#await Object.values(dataarrays)[0].data then d}
                <StackedArea data = {d} xaccessor={d=>d.time} {layers} bind:stacked_data={stack}></StackedArea>
              {/await}
            {/if}
            <Cursor let:x let:y let:sx let:sy>
              <VertCursor {x} ></VertCursor>
              <BoxCursor {x} content = {content(sx)}></BoxCursor>
            </Cursor>
          </LineGraph>
        </div>
      </div>
		</div>
	</div>
</section>