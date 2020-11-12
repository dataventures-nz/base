<script>
import * as d3 from 'd3'
import * as dfunc from 'date-fns'
import _ from 'lodash'
import WaterfallGraph from '$components/charts/WaterfallGraph.svelte'
import {single_only} from '$components/map/select_modes.mjs'
import QueryMap from './QueryMap.svelte'
import {tokenPromise} from '$components/security.mjs'
import whitelist from "./whitelist_public.json"
import default_layerlist from "./field_to_layer.json"
import Dropdown from './Dropdown.svelte';
import DatePicker from '$components/datepicker/DatePicker.svelte';
import Clear from './Clear.svelte';
import {query} from '$components/api.mjs'


let datefields = []
let datefield
let table = {}
let startDate = new Date(2020,2,1)
let endDate = new Date(2020,6,1)
let dateformat ="yyyy-MM-dd'T'00:00:00'Z'"
let layerlist = default_layerlist
let allowedlayers = []
let match
let currentlayer = 0
let selection = []
let dbfield = ""

// when we get schema written, this will be pulled from schema cache.
async function tablechanged(){
	const tablespec = table.endpoint.tables.find(d=>table.table===d.table)

	if (tablespec){ // from file, rather than from server
		datefields = tablespec.datefields
    // dateformat = tablespec.dateformat
    datefield = ""
		return
	}

	const _meta = d3.json(table.endpoint.endpoint + "/meta/" + table.table, {
		method: 'GET',
		headers: {
			'Access-Control-Allow-Headers':['Authorization'],
			'Authorization': "Bearer "+ await tokenPromise
		}
	})

	const meta = await _meta

  allowedlayers = Object.keys(meta.fields)
  allowedlayers = _.intersection(allowedlayers,layerlist.map(d=>d.db.field))

  const fields = _.invertBy(meta.fields)
  datefields = fields.date || []
  datefield = ""
}

function make_match(selection,dbfield,datefield,startDate,endDate){
  let newmatch = {}
  if (dbfield && selection.length){
    const idlist = selection.map(d=>+d.area_id)
    newmatch[dbfield] = {$in:idlist}
  }

  if(datefield && (startDate || endDate)){
    newmatch[datefield]= {}
    if (startDate) {newmatch[datefield].$gte = {$date:dfunc.format(startDate,dateformat)}}
    if (endDate) {newmatch[datefield].$lt = {$date:dfunc.format(endDate,dateformat)}}  
  }

  const projection = {_id:false,time:true,count:true}

  const pipeline = [{$match:newmatch},{$project:projection}]

  return pipeline
}

const clearmapselection = function(){
  layerlist[currentlayer].map.selection = []
}

const cleardateselection = function(){
  datefield = ""
  startDate.setValue(null)
  endDate.setValue(null)
  startDate.associated.value = null
  endDate.associated.value = null
  startdatedata = null
  enddatedata = null
}

let period = 7*24*3600000

let options={
  height:600,
  width:600,
  color:"darkblue",
  xdomain: [0,period],
  ydomain:[0,100000],
  yaccessor: d=>+d.count,
  xaccessor: d=>d.offset,
}



function clean(data){
  let groups ={}
  data.map(function(d){
    d.time = new Date(d.time)
    d.cycle = Math.floor(d.time/period)
    d.offset = d.time%period
  })
  
  data.sort((a,b)=>a.time-b.time)
  options.yextent=d3.extent(data,options.yaccessor)
  options.ydomain[1]=options.yextent[1]

  data.map(function(d){
    if(groups[d.cycle]){groups[d.cycle].data.push(d)} else {groups[d.cycle]={data:[d]}}
  })
  return groups
}


$: dbfield = layerlist[currentlayer].db.field
$: selection = layerlist[currentlayer].map.selection
$: match = make_match(selection,dbfield,datefield,startDate,endDate)

let data
function plot(){data = query("population",table.table,match).then(clean)}

$:console.log(data)





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
    outline: none;
	}



  .box{
    position:relative;
    border: 1px solid black;
    padding: 5px;
    margin:5px;
  }

</style>

<section class = "container select-wrapper">
 	<div class="row">
   	<div class="col-md-6">
      <div class=box>
            <p>First choose a table to query </p>
            <div class="select control is-fullwidth">
              <Dropdown whitelist={whitelist} on:change={tablechanged} bind:table={table}/>
        </div>
      </div>
      <div class=box>
        <Clear clearfn = {clearmapselection}></Clear>
        <p >Optional: Select specific areas</p>
        <div>
          <QueryMap height = 650 selectMode={single_only} {allowedlayers} bind:layerlist bind:currentlayer ></QueryMap>
        </div>
      </div>
		</div>
   	<div class="col-md-6">
   	  <div class=box>
        <Clear clearfn = {cleardateselection}></Clear>
        <div class = "columns select-wrapper">
          <div class = column>
            <p> Optional: Filter by date</p>
            <div class="select control is-fullwidth">
              <select name="Choosedatefield" bind:value = {datefield} class="input">
                <option selected disabled class="header" value="">Choose a Date field</option>
                {#each datefields as field}
                  <option class = "option" value={field}> {field} </option>
                {/each}
              </select>
              <div>
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
        <p>{JSON.stringify(match)}</p>
      </div>
      <div class=box>
        {#if data}
          {#await data}
            {JSON.stringify(options)}
          {:then groups} 
            <WaterfallGraph groups={groups} bind:options={options}/>
          {/await}
        {/if}
        
      </div>
		</div>
	</div>
</section>
