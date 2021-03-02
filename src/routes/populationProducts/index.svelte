<script>
  import {mappable_fields,time_fields} from '../../components/_utils/schemautils.js'
  import LineGraph from '$components/charts/linegraph/LineGraph.svelte'
  import StackedArea from '../../components/charts/linegraph/StackedArea.svelte'
  import { xor_only} from '$components/map/select_modes.mjs'
  import QueryMap from './QueryMap.svelte'
  import Cursor from '$components/charts/linegraph/Cursor.svelte'
  import VertCursor from './VertCursor.svelte'
  import BoxCursor from './BoxCursor.svelte'
  import DatePicker from '$components/datepicker/DatePicker.svelte'
  import DateSlider from '$components/datepicker/DateSlider.svelte'
  import { query, getSchema} from '$components/api.mjs'
  import ChartPrinter from '$components/charts/ChartPrinter.svelte'
  import * as d3 from "d3"
  import * as df from "date-fns"


  let filename = "graph"
  let datefield = "time"
  let layerlist
  let table = "hourly_materialised"
  let startDate = new Date(2020,3,1)
  let endDate = new Date(2020,5,1)
  let extent = [new Date(2020,3,1), new Date(2020,6,1) ]
  let currentlayer = 0
  let selection = []
  let dbfield = ""
  const db = 'population'

  let maplayerpromise = getSchema(`&${db}/${table}`)
    .then(d=>mappable_fields(d))
    .then(d=>{layerlist = d})

  async function getyears(){
    let now = (new Date()).getFullYear()
    let startquery = [{"$sort": {"time": 1}}, {"$limit": 1}, {"$project": {"time": 1}}]
    let s = await query("population",table,startquery).then(d=>new Date(d[0].time))
    let start = s.getFullYear()
    let n = now-start    
    console.log({now,start})
    console.log(now-start)
    return Array(n+1).fill().map((d,i)=>i+start+1)
  }

  $: console.log(getyears())

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
    const group = {
        "_id":"$time",
        "time":{"$first":"$time"},
        "count":{"$sum":"$count"},
        "local":{"$sum":"$local"},
        "domestic":{"$sum":"$domestic"},
        "international":{"$sum":"$international"},
        "unknown":{"$sum":"$unknown"}
        }

    const projection = {_id:false,time:true,count:true,local:true,domestic:true,international:true,unknown:true}
    const pipeline = [{$match:newmatch},{$group:group},{$project:projection}]
    return pipeline
  }

  function clean(data){
    data.map(function(d){
      d.Total = +d.count
      d.Domestic = +d.domestic
      d.International = +d.international
      d.Local = +d.local
      d.Unknown = +d.unknown
      d.time = new Date(d.time)
    })
    data.sort((a,b)=>a.time-b.time)
    return data
  }


  // $: dbfield = layerlist[currentlayer]?.db?.field ?? ""
  // $: if (selection){ 
  //     selection = JSON.parse(JSON.stringify(layerlist[currentlayer].map.selection))
  //     const match =  make_match(selection,dbfield,datefield,startDate,endDate)
  //     const data = query("population",table,match).then(clean)
  //     console.log(data)
  // }

  let svg
  let width
  let chartdiv
  $: if (chartdiv){width=(chartdiv.getBoundingClientRect().width)-12}


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
    display: inline-block;
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
        <input type="radio" id={"before"} checked name="explorer" value={"before"} on:click={()=>console.log("before")}>
        <label for={"before"}>Before</label> 
        <input type="radio" id={"between"} disabled name="explorer" value={"between"} on:click={()=>console.log("between")}>
        <label for={"between"}>Between</label> 
      </div>
    </div>
  </div>
 	<div class="row">
   	<div class="col-md-5">
      <div class=box>
        <p>Select an area</p>
        {#await maplayerpromise }
        Waiting for map
        {:then maplayers}
          <QueryMap height = 700 selectMode={xor_only} bind:layerlist {currentlayer} ></QueryMap>
        {/await}
      </div>
		</div>
   	<div class="col-md-7">
      <div class="row">
        <div class="col-md-12">
          <div class=box>
            Pick a map layer for aggregation:<br/>
            {#await maplayerpromise }
            waiting for buttons
            {:then maplayers}
              {#each layerlist as layer,i}
                <input type="radio" id={layer.map.name} name="layer" checked = {i==currentlayer} value={i} on:click={()=>currentlayer=i}>
                <label for={layer.map.name}>{layer.map.name}</label> <br/>
              {/each}
            {/await}
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-5">
          <div class=box>
            <p> Filter by date</p>
            <div class="select control is-fullwidth">
              <div class = flex>
                <DatePicker bind:selected = {startDate} isAllowed={(date)=>date<=endDate && date>=extent[0] && date<= extent[1]}/>
                <DatePicker bind:selected = {endDate} isAllowed={(date)=>date>=startDate && date>=extent[0] && date<= extent[1]}/>
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
        <DateSlider bind:start={startDate} bind:end={endDate} {extent}/>
      </div>
		</div>
	</div>
</section>