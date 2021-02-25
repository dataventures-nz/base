<script>
import Cursor from '$components/charts/linegraph/Cursor.svelte'
import LineGraph from '$components/charts/linegraph/LineGraph.svelte'
import StackedArea from '../../components/charts/linegraph/StackedArea.svelte'
import { xor_only, single_only } from '$components/map/select_modes.mjs'
import QueryMap from './QueryMap.svelte'
import VertCursor from './VertCursor.svelte'
import BoxCursor from './BoxCursor.svelte'
import DatePicker from '$components/datepicker/DatePicker.svelte'
import { query } from '$components/api.mjs'
import ChartPrinter from '$components/charts/ChartPrinter.svelte'
import * as d3 from "d3"
import * as df from "date-fns"


let filename = "graph"
let datefield = "time"
let table = "hourly_materialised"
let startDate = new Date(2020,3,1)
let endDate = new Date(2020,5,1)
let layerlist = []
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

// $: dbfield = layerlist[currentlayer]?.db?.field ?? ""
// $: if (selection){
//   selection = JSON.parse(JSON.stringify(layerlist[currentlayer].map.selection))
//   let newdataarrays = {} 
//   selection.map(function(s){newdataarrays[s.name]=dataarrays[s.name]||addtodataarrays(s)})
//   dataarrays = newdataarrays
// }

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
      name:"Local",
      accessor: d => d.mean ? d.mean("Local") : d.Local,
      style:{fill:"#5F93DC",stroke:"none"}
    },
    {
      name:"Domestic",
      accessor: d => d.mean ? d.mean("Domestic") :d.Domestic,
      style:{fill:"#ca637f",stroke:"none"}
    },
    {
      name:"International",
      accessor: d => d.mean ? d.mean("International") : d.International,
      style:{fill:"#F5BC61"}
    },
    {
      name:"Unknown",
      accessor: d => d.mean ? d.mean("Unknown") : d.Unknown,
      style:{fill:"#ccc",stroke:null}
    }
  ]

  let stack
  function content(sx){

    // let data = stack[1].map(d=>d.data)
    if (stack){
      
      let m = d3.minIndex(stack[1],d=>Math.abs(d.data.time-sx))
      
      if (stack[1][m]){
      let d = stack[1][m]["data"]
      return ["time: "+d.time,"total: "+d.count,
      "visitors: "+((d.domestic*1)+(d.international*1)+(d.unknown*1))]
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
    <div class="col-md-12">
      <div class=box>
        some tabby thingies to choose between before and between
      </div>
    </div>
  </div>
 	<div class="row">
   	<div class="col-md-5">
      <div class=box>
        <p>Select an area</p>
          <!-- <QueryMap height = 700 selectMode={xor_only} {allowedlayers} bind:layerlist currentlayer={0} ></QueryMap> -->
      </div>
		</div>
   	<div class="col-md-7">
      <div class="row">
        <div class="col-md-5">
          <div class=box>
            <p> Filter by date</p>
            <div class="select control is-fullwidth">
              <div class = flex>
                <DatePicker bind:selected = {startDate} isAllowed={(date)=>date<=endDate}/>
                <DatePicker bind:selected = {endDate} isAllowed={(date)=>date>=startDate}/>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-7">
          <div class =box>
            key
          </div>
        </div>
      </div>
      
      <div class=box>
        <LineGraph xtime={true} width = {800} ysuppressZero={false} intercepts = {"bottom_left"} >
          <!-- <StackedArea data = {datefilter(d.data)} xaccessor={d=>d.time} {layers} bind:stacked_data={stack}></StackedArea>
          <Cursor let:x let:y let:sx let:sy>
            <VertCursor {x} ></VertCursor>
            <BoxCursor {x} content = {content(sx)}></BoxCursor>
          </Cursor> -->
        </LineGraph>
      </div>
      <div class=box>
        <LineGraph xtime={true} width = {800} ysuppressZero={false} intercepts = {"bottom_left"} >
          <!-- <StackedArea data = {datefilter(d.data)} xaccessor={d=>d.time} {layers} bind:stacked_data={stack}></StackedArea>
          <Cursor let:x let:y let:sx let:sy>
            <VertCursor {x} ></VertCursor>
            <BoxCursor {x} content = {content(sx)}></BoxCursor>
          </Cursor> -->
        </LineGraph>
      </div>
      <div class=box>
        filter slider
      </div>
		</div>
	</div>
</section>