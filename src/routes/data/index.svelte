<script>
  import {userPromise, tokenPromise} from '$components/security.mjs'
  // const putTextOnClipboard = text => navigator.clipboard.writeText(text)
  import * as d3 from 'd3'
  import _ from 'lodash'
  import {xor_only} from '../../components/map/select_modes.js'
  import QueryMap from './QueryMap.svelte'
  import {download} from '../../components/_utils/download.js'
  // import default_layerlist from "./field_to_layer.json"
  import GroupedDropdown from '../../components/DropdownTree/GroupedDropdown.svelte';
  import Datepicker from '../../components/datepicker/DatePicker.svelte';
  import CopyBox from '../../components/CopyBox.svelte';
  import Tabs from '../../components/tabs/Tabs.svelte';
  import Tab from '../../components/tabs/Tab.svelte';
  import Clear from '../../components/Clear.svelte';
  import {query,get_api,api_url,listDatabases,listCollections, normalise} from '$components/api.mjs'

  let datefields = []
  let datefield
  let collection //={mappableFields:[],db:""}
  let startDate
  let endDate
  let dateformat ="#YYYY-MM-DD 00:00:00#"
  let deselect_datefield = true
  let layerlist = []
  let allowedlayers = ["sa2_2018_code","TALB2020_code","region_2018_code"]
  let filename = "mydata.csv"
  let startdatedata = ""
  let enddatedata = ""
  let match
  let currentlayer = 0
  let selection = []
  let dbfield = ""
  let r
  let option = undefined
  let table = ""
  let copytext
  let tokentext = "tokentext"
  
  $: console.log(collection)
  $: collection && (layerlist = collection.mappableFields)
  
  function displayname(collection){
    return collection.db +"/"+collection.collection 
  }
  
  function mappable_fields(collection){
    let maplayers = []
    Object.entries(collection.schema.properties).map(d=>{
      if(d[1].map){
        d[1].map.selection = []
        maplayers.push({
          db:{field:d[0]},
          map:d[1].map,
          ui:{visible:false,include:true}
        })
      }
    })
    return maplayers
  }

  function time_fields(collection){
    let timefields = []
    Object.entries(collection.schema.properties).map(d=>{
      if(d[1].bsonType == "date"){timefields.push(d[0])}
    })
    return timefields
  }


  async function get_allowed_db(){
    let collections = await listDatabases()
    let value =  collections.map(d=>{
        return {
          displayName:displayname(d),
          mappableFields:mappable_fields(d),
          timeFields:time_fields(d)  
        }
      }
    )
    return value
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
  
    return normalise(newmatch)
  }
  
  
  const curlhead = 'curl -X POST  -H "Content-Type: application/json" -H "Authorization: Bearer '
  
  let copyoptions = [
    {
      label:"download",
      copytext:()=>null
    },
    {
      label:"mongo query",
      copytext:(match)=>JSON.stringify(match)
    },
    {
      label:"curl your query",
      copytext:(match,collection)=>{
        return curlhead+tokentext+`" -d '`+JSON.stringify(match)+"' "+api_url(service)
      }
    },
    {
      label:"R script",
      copytext:(match,table,r)=> r?r.textContent:null
    },
    {
      label:"just your token",
      copytext:()=>tokentext
    }
  ]
  option = copyoptions[0] 
  
  async function token(){
    tokentext = await tokenPromise() 
  }
  
  token()
  
  const tabclick = function(i){
    collection.mappableFields[currentlayer].selection = selection
    currentlayer=i
    selection = collection.mappableFields[i].selection ? collection.mappableFields[i].selection : []
  }

  const clearmapselection = function(){
    collection.mappableFields[currentlayer].map.selection = []
  }

  const cleardateselection = function(){
    datefield = ""
    startDate = null
    endDate = null
  }
  
  function startDownload() {
    const url = api_url(service)
    download(url, match, filename)
  }

  let service
  $: console.log({collection,currentlayer,dbfield,selection,service})
  $: if(collection){dbfield = collection.mappableFields[currentlayer].db.field}
  $: if(collection){service = collection.displayName}
  $: match = make_match(selection,dbfield,datefield,startDate,endDate)
  $: copytext = option.copytext(match,table,r)
  
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
  
    .pseudopre{
      word-break: break-all;
      overflow-wrap: break-word;
      width:90%;
      background-color: #f5f5f5;
      color: #4a4a4a;
      font-family: monospace;
      font-size: .875em;
      padding: 1.25rem 1.5rem;
    }
  
    .hovershow{
      display:none
    }
    .hoverer:hover{
      .hoverhide {
        display:none
      }
      .hovershow {
        display:inline
      }
    }
  
    .box{
      position:relative  
    }
  
  </style>

  <section class = "container select-wrapper">
    <div class="row">
      <div class="col-md-5">
        <div class=box>
          <p>First choose a collection to query </p>
          <div class="select control is-fullwidth">
            {#await get_allowed_db() then dbs}
              <select name="Choosecollection" bind:value = {collection} class="input">
                <option selected disabled class="header" value="">Choose a Collection </option>
                {#each dbs as db}
                  <option class = "option" value={db}> {db.displayName} </option>
                {/each}
              </select>
            {/await}
          </div>
        </div>
        <div class=box>
          <Clear clearfn = {clearmapselection}></Clear>
          <p >Optional: Select specific areas</p>
            <div style='margin-bottom:0;height:42px'>
              <Tabs>
                {#if collection}
                  {#each collection.mappableFields as layer,i}
                    <Tab label={layer.map.name} index={i} onClick={()=>tabclick(i)} ></Tab>
                  {/each}
                {/if}
              </Tabs>
            </div>
          <div>
            <QueryMap 
              height = 650 
              selectMode={xor_only}
              layerlist =  {collection ? collection.mappableFields:[]}
              bind:selection
              bind:currentlayer
            ></QueryMap>
          </div>
        </div>
      </div>
       <div class="col-md-7">
         <div class=box>
          <Clear clearfn = {cleardateselection}></Clear>
          <div class = "row select-wrapper">
            <div class = col-md-12>
              <p> Optional: Filter by date</p>
              <div>
                <select name="Choosedatefield" bind:value = {datefield} class="input">
                  <option selected disabled class="header" value="">Choose a Date field</option>
                  {#if collection}
                    {#each collection.timeFields as field}
                      <option class = "option" value={field}> {field} </option>
                    {/each}
                  {/if}  
                </select>
              </div>
            </div>
          </div>
          <div class = "columns select-wrapper">
            <div class = column>
              <Datepicker bind:selected={startDate}
              placeholder = "From Date (Inclusive)"
              />
            </div>
            <div class = column>
              <Datepicker bind:selected={endDate}
              placeholder = "To Date"
              />
            </div>
          </div>
        </div>
        <div class=box>
          <div class = "columns select-input-wrapper">
            <div class = "column" style="padding-top:0px">
              <div style='margin-bottom:0;height:42px'>
                  <Tabs>
                    {#each copyoptions as {label,fn},i}
                      <Tab {label} index={i} onClick={() => option = copyoptions[i]} ></Tab>
                    {/each}
                  </Tabs>
              </div>
              <CopyBox text = {copytext}>
                {#if option.label == "download"}
                  <input type="text" placeholder="filename.csv" bind:value={filename}/>
                  <button type="button" class="btn-secondary download" disabled={false} on:click={startDownload}>
                    Download
                    <!-- <span><img alt="" class='icon-download' src='../svg/download-icon.svg'/></span> -->
                  </button>
                {:else if option.label == "mongo query"}
                  <pre>{JSON.stringify(match, undefined, 2)}</pre>
                {:else if option.label == "curl your query"}
                  <div class = "pseudopre" >
                    {curlhead }
                    <span class="hoverer">
                      <span class="hoverhide" >&lt your token &gt"</span>
                      <span class="hovershow">{tokentext}"</span>
                    </span>
                      -d '{JSON.stringify(match)}' {api_url(service)}
                  </div>
                {:else if option.label == "R script"}
  <pre id="R" bind:this={r}>
  library(tidyverse)
  library(httr)
  
  mydataframe &lt;- POST(
      url = "{api_url(service)}",
      add_headers(Authorization = "Bearer {tokentext}"  
      body = '{JSON.stringify(match)}',
      content_type_json()
    ) %&gt;%
    content(as = "text") %&gt;%
    read.csv(text=.)
  </pre>
                {:else if option.label == "just your token"}
                  <div class = pseudopre >{tokentext}</div>
                {/if}
              </CopyBox>
            </div>
          </div>
        </div>
        <!-- <button on:click={console.log(match)}>click for console.log(match)</button> -->
      </div>
    </div>
  </section>
  