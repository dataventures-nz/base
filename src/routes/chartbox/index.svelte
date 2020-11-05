<script>
import * as d3 from 'd3'
import _ from 'lodash'
import {xor_only} from '$components/map/select_modes.mjs'
import QueryMap from './QueryMap.svelte'
import {tokenPromise} from '$components/security.mjs'
import whitelist from "./whitelist_public.json"
import default_layerlist from "./field_to_layer.json"
import Dropdown from './Dropdown.svelte';
import Datepicker from '$components/datepicker/Datepicker.svelte';
import Clear from './Clear.svelte';

let datefields = []
let datefield
let table = {}
let startDate
let endDate
let dateformat ="#YYYY-MM-DD 00:00:00#"
let layerlist = default_layerlist
let allowedlayers = []
let filename = "mydata.csv"
let startdatedata = ""
let enddatedata = ""
let match
let currentlayer = 0
let selection = []
let dbfield = ""
let mindate = new Date().setFullYear(2000)
let maxdate = new Date()

let formatTime = d3.timeFormat("%B %d, %Y");

// when we get schema written, this will be pulled from schema cache.
async function tablechanged(){
	const tablespec = table.endpoint.tables.find(d=>table.table===d.table)

	if (tablespec){ // from file, rather than from server
		datefields = tablespec.datefields
    dateformat = tablespec.dateformat
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
	dateformat ="#YYYY-MM-DD 00:00:00#"
  datefield = ""
}

function make_match(selection,dbfield,datefield,startdatedata,enddatedata){
  let newmatch = {}
  if (dbfield && selection.length){
    const idlist = selection.map(d=>+d.area_id)
    newmatch[dbfield] = {$in:idlist}
  }

  if(datefield && (startdatedata || enddatedata)){
    newmatch[datefield]= {}
    if (startdatedata) {newmatch[datefield].$gte = startdatedata}
    if (enddatedata) {newmatch[datefield].$lt = enddatedata}  
  }

  return newmatch
}


// async function token(){
//   tokentext = await tokenPromise 
// }

// token()

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

$: startDate && startDate.on("data",()=>startdatedata=startDate.getDateString(dateformat))
$: endDate && endDate.on("data",()=>enddatedata = endDate.getDateString(dateformat))
$: dbfield = layerlist[currentlayer].db.field
$: selection = layerlist[currentlayer].map.selection
$: match = make_match(selection,dbfield,datefield,startdatedata,enddatedata)


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
          <QueryMap height = 650 selectMode={xor_only} {allowedlayers} bind:layerlist bind:currentlayer ></QueryMap>
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
              <Datepicker start={mindate} end={maxdate} format={formatTime}/>
              {formatTime(mindate)}
            </div>
          </div>
        </div>
        <div class = "columns select-wrapper">
          <div class = column>
          </div>
        </div>
      </div>
      <div class=box>

      </div>
		</div>
	</div>
</section>
