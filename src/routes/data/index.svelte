<script>
  import {userPromise, tokenPromise} from '$components/security.mjs'
  // const putTextOnClipboard = text => navigator.clipboard.writeText(text)
  import * as d3 from 'd3'
  import _ from 'lodash'
  import {xor_only} from '../../components/map/select_modes.js'
  import QueryMap from './QueryMap.svelte'
  import {download} from '../../components/_utils/download.js'
  import default_layerlist from "./field_to_layer.json"
  import GroupedDropdown from '../../components/DropdownTree/GroupedDropdown.svelte';
  import Datepicker from '../../components/datepicker/DatePicker.svelte';
  import CopyBox from '../../components/CopyBox.svelte';
  import Tabs from '../../components/tabs/Tabs.svelte';
  import Tab from '../../components/tabs/Tab.svelte';
  import Clear from '../../components/Clear.svelte';
  import {query,get_api,listDatabases,listCollections} from '$components/api.mjs'

  let datefields = []
  let datefield
  let collection
  let startDate
  let endDate
  let dateformat ="#YYYY-MM-DD 00:00:00#"
  let deselect_datefield = true
  let layerlist = default_layerlist
  let allowedlayers = ["sa2_2018_code","TALB2020_code","region_2018_code"]
  let filename = "mydata.csv"
  let startdatedata = ""
  let enddatedata = ""
  let match
  let currentlayer = 0
  let selection = []
  let dbfield = ""
  let r
  let option
  let table = ""
  let copytext
  let tokentext = "tokentext"
  
  $: console.log({currentlayer})
  // when we get schema written, this will be pulled from schema cache.
  async function collectionChanged(){
  
  // set layers, date fields and format into global space  
    // allowedlayers = _.intersection(allowedlayers,layerlist.map(d=>d.db.field))
    // allowedlayers = ["sa2_2018_code","TALB2020_code","RTO_code","region_2018_code"]
  
    datefields = ["time","date"]
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
  
  
  const curlhead = 'curl -X POST  -H "Content-Type: application/json" -H "Authorization: Bearer '
  
  let copyoptions = [
    {
      label:"download",
      fn:function(i){option=copyoptions[i]},
      copytext:()=>null
    },
    {
      label:"mongo query",
      fn:function(i){option=copyoptions[i]},
      copytext:(match)=>JSON.stringify(match)
    },
    {
      label:"curl your query",
      fn:function(i){option=copyoptions[i]},
      copytext:(match,table)=>{
        return curlhead+tokentext+`" -d '`+JSON.stringify(match)+"' "+(table.endpoint && table.endpoint.endpoint)+"/api/"+table.table 
      }
    },
    {
      label:"R script",
      fn:function(i){option=copyoptions[i]},
      copytext:(match,table,r)=> r?r.textContent:null
    },
    {
      label:"just your token",
      fn:function(i){option=copyoptions[i]},
      copytext:()=>tokentext
    }
  ]
  option = copyoptions[0]
  
  async function token(){
    tokentext = await tokenPromise() 
  }
  
  token()
  
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
  
  function startDownload() {
    // const url = table.endpoint && table.endpoint.endpoint
    // const service = table.table
    // download(url, service, match, filename)
  }
  
  $: startDate && startDate.on("data",()=>startdatedata=startDate.getDateString(dateformat))
  $: endDate && endDate.on("data",()=>enddatedata = endDate.getDateString(dateformat))
  $: dbfield = layerlist[currentlayer].db.field
  $: selection = layerlist[currentlayer].map.selection
  $: match = make_match(selection,dbfield,datefield,startdatedata,enddatedata)
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
      width:100%;
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
                {#await listDatabases() then database}
                  <GroupedDropdown 
                    placeholder = {"Choose a collection"}
                    groups={database} 
                    groupaccessor={d=>d.name} 
                    subgroupaccessor = {listCollections}
                    valueaccessor = {d=>d}
                    labelaccessor = {d=>d.collection} 
                    onChange={collectionChanged} 
                    bind:value={collection}/>
                {/await}
          </div>
        </div>
        <div class=box>
          <Clear clearfn = {clearmapselection}></Clear>
          <p >Optional: Select specific areas</p>
            <div style='margin-bottom:0;height:42px'>
              <Tabs>
                {#each layerlist as layer,i}
                  {#if allowedlayers.find(d=>d==layer.db.field)}
                    <Tab label={layer.map.name} index={i} onClick={()=>currentlayer=i} ></Tab>
                  {/if}
                {/each}
              </Tabs>
          </div>
          <div>
            <QueryMap height = 650 selectMode={xor_only} {allowedlayers} bind:layerlist bind:currentlayer ></QueryMap>
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
                  {#each datefields as field}
                    <option class = "option" value={field}> {field} </option>
                  {/each}
                </select>
              </div>
            </div>
          </div>
          <div class = "columns select-wrapper">
            <div class = column>
              <Datepicker bind:datepicker={startDate}
              placeholder = "From Date (Inclusive)"
              />
            </div>
            <div class = column>
              <Datepicker bind:datepicker={endDate}
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
                      <Tab {label} index={i} onClick={()=>fn(i)} ></Tab>
                    {/each}
                  </Tabs>
              </div>
              <CopyBox text = {copytext}>
                {#if option.label == "download"}
                  <input type="text" placeholder="filename.csv" bind:value={filename}/>
                  <button type="button" class="btn-secondary download" disabled={!table.table} on:click={startDownload}>
                    Download
                    <span><img alt="" class='icon-download' src='../svg/download-icon.svg'/></span>
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
                      -d '{JSON.stringify(match)}' {table.endpoint && table.endpoint.endpoint}/api/{table.table}
                  </div>
                {:else if option.label == "R script"}
  <pre id="R" bind:this={r}>
  library(tidyverse)
  library(httr)
  
  mydataframe &lt;- POST(
      url = "{table.endpoint && table.endpoint.endpoint+"/api/"+table.table}",
      add_headers(Authorization = "Bearer {tokentext}"  
      body = '{JSON.stringify(match)}',
      content_type_json()
    ) %&gt;%
    content(as = "text") %&gt;%
    read.csv(text=.)
  </pre>
                {:else if option.label == "just your token"}
                  <pre>{tokentext}</pre>
                {/if}
              </CopyBox>
            </div>
          </div>
        </div>
        <!-- <button on:click={console.log(match)}>click for console.log(match)</button> -->
      </div>
    </div>
  </section>
  