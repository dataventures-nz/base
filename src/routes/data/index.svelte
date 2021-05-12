<script>
  import { userPromise, tokenPromise } from '$lib/security.js'
  // const putTextOnClipboard = text => navigator.clipboard.writeText(text)
  import * as d3 from 'd3'
  import _ from 'lodash'
  import { xor_only } from '$lib/map/select_modes.js'
  import QueryMap from './QueryMap.svelte'
  import { download } from '$lib/_utils/download.js'
  import { mappable_fields, time_fields } from '$lib/_utils/schemautils.js'
  import Datepicker from '$lib/datepicker/DatePicker.svelte'
  import CopyBox from '$lib/CopyBox.svelte'
  // import Tabs from '$lib/tabs/Tabs.svelte'
  // import Tab from '$lib/tabs/Tab.svelte'
  import { query, get_api, api_url, listDatabases, listCollections, normalise } from '$lib/api.js'
  import {
    ButtonGroup,
    ButtonGroupItem,
    Row,Col,
    Card,
    Tabs,Tab,TabContent,
    Avatar,
    AppBar,
    Button,
    Icon,
    Menu,
    ListItem,
    MaterialApp,
    CardText,
    Select
  } from 'svelte-materialify'

  let datefields = []
  let datefield
  let collection = undefined
  let startDate
  let endDate
  let dateformat = '#YYYY-MM-DD 00:00:00#'
  let deselect_datefield = true
  let layerlist = []
  let allowedlayers = ['sa2_2018_code', 'TALB2020_code', 'region_2018_code']
  let filename = 'mydata.csv'
  let match
  let currentlayer = 0
  let selection = []
  let dbfield = ''
  let r
  let option = undefined
  let table = ''
  let copytext
  let tokentext = 'tokentext'

  $: layerlist = collection?.mappableFields ?? []
  $: console.log(collection)

  function displayname(collection) {
    return collection.db + '/' + collection.collection
  }

  async function get_allowed_db() {
    let collections = await listDatabases()
    console.log(collections)
    let value = collections.map(d => {
      return {
        name: displayname(d),
        value2:displayname(d),
        value: {
          displayName: displayname(d),
          mappableFields: mappable_fields(d),
          timeFields: time_fields(d),
          currentlayer: 0
        }
      }
    })
    return value
  }

  function make_match(selection, dbfield, datefield, startdatedata, enddatedata) {
    let newmatch = {}
    if (dbfield && selection.length) {
      const idlist = selection.map(d => +d.area_id)
      newmatch[dbfield] = { $in: idlist }
    }

    if (datefield && (startdatedata || enddatedata)) {
      newmatch[datefield] = {}
      if (startdatedata) {
        newmatch[datefield].$gte = startdatedata
      }
      if (enddatedata) {
        newmatch[datefield].$lt = enddatedata
      }
    }

    return normalise(newmatch)
  }

  const curlhead = 'curl -X POST  -H "Content-Type: application/json" -H "Accept: text/csv" -H "Authorization: Bearer '

  let copyoptions = [
    {
      label: 'download',
      copytext: () => null
    },
    {
      label: 'mongo query',
      copytext: match => JSON.stringify(match)
    },
    {
      label: 'curl your query',
      copytext: (match, collection) => {
        return curlhead + tokentext + `" -d '` + JSON.stringify(match) + "' " + api_url(service)
      }
    },
    {
      label: 'R script',
      copytext: (match, table, r) => (r ? r.textContent : null)
    },
    {
      label: 'just your token',
      copytext: () => tokentext
    }
  ]
  option = copyoptions[0]

  async function token() {
    tokentext = await tokenPromise()
  }

  token()

  const tabclick = function (i) {
    collection.mappableFields[collection.currentlayer].selection = selection
    collection.currentlayer = i
    currentlayer = i
    selection = collection.mappableFields[i].selection ? collection.mappableFields[i].selection : []
  }

  const collectionchanged = function (a, b) {
    currentlayer = collection.currentlayer
    selection = collection?.mappableFields[collection.currentlayer]?.selection
      ? collection.mappableFields[collection.currentlayer].selection
      : []
  }

  const clearmapselection = function () {
    console.log(collection)
    collection.mappableFields[collection.currentlayer].map.selection = []
    selection = []
  }

  const cleardateselection = function () {
    datefield = ''
  }

  function startDownload() {
    const url = api_url(service)
    download(url, match, filename)
  }

  let service
  $: if (collection && collection?.mappableFields?.length) {
    collection.mappableFields[collection.currentlayer].selection = selection
  }
  $: if (collection && collection?.mappableFields?.length) {
    dbfield = collection.mappableFields[collection.currentlayer].db.field
  } else {
    dbfield = null
  }
  $: if (collection) {
    service = collection.displayName
  }
  $: match = make_match(selection, dbfield, datefield, startDate, endDate)
  $: copytext = option.copytext(match, table, r)
  let dropdownCollection // hack because Materialised Select is a little broken
  $: collection = Array.isArray(dropdownCollection)?undefined:dropdownCollection
</script>
<Row>
  <Col col={12} md={5}>
    <Card>
      <CardText>
      {#await get_allowed_db() then dbs}
        <Select dense items={dbs} bind:value={dropdownCollection}>First choose a collection to query</Select>
      {/await}
      </CardText>
    </Card>
    <Card>
      <CardText> <p>Optional: Select specific areas</p> </CardText>
      <ButtonGroup>
          {#if collection}
            {#each collection.mappableFields as layer, i}
            <ButtonGroupItem on:click={() => tabclick(i)}>{layer.map.name}</ButtonGroupItem>
            {/each}
          {/if}      
      </ButtonGroup>
      <QueryMap
      height="650"
      selectMode={xor_only}
      layerlist={collection ? collection.mappableFields : []}
      bind:selection
      bind:currentlayer
    />
      <div>
        <Button class="red white-text" on:click={clearmapselection}>Clear Selection</Button>
      </div>
    </Card>   
  </Col>
  <Col col={12} md={7}>
    <Card>
      <CardText>
        {#if collection}
          <Select dense items={collection.timeFields} bind:value={datefield}>Optional: Select time field</Select>
        {/if}
        <Datepicker bind:selected={startDate} placeholder="From Date (Inclusive)" />
        <Datepicker bind:selected={endDate} placeholder="To Date" />
        </CardText>
    </Card>
    <Card>
      <CardText>You get what you're Given, and you Like It</CardText>
      <Tabs grow class="green-text">
        <div slot="tabs">
          <Tab>Download</Tab>
          <Tab>Mongo query</Tab>
          <Tab>CURL</Tab>
          <Tab>R script</Tab>
          <Tab>Just your token</Tab>
        </div>
        <TabContent>
          <input type="text" placeholder="filename.csv" bind:value={filename} />
          <button type="button" class="btn-secondary download" disabled={false} on:click={startDownload}>
            Download
          </button>
        </TabContent> 
        <TabContent>
          <CopyBox text={copyoptions[1].copytext(match, table, r)}>
            <pre>{JSON.stringify(match, undefined, 2)}</pre>
          </CopyBox>
        </TabContent> 
        <TabContent>
          <CopyBox text={copyoptions[2].copytext(match, table, r)}>
            <div class="pseudopre">
              {curlhead}
              <span class="hoverer">
                <span class="hoverhide">&lt your token &gt"</span>
                <span class="hovershow">{tokentext}"</span>
              </span>
              -d '{JSON.stringify(match)}' {api_url(service)}
            </div>
          </CopyBox>
        </TabContent>
        <TabContent>
          <CopyBox text={copyoptions[3].copytext(match, table, r)}>
          <pre id="R" bind:this={r}>
library(tidyverse)
library(httr)

mydataframe &lt;- POST(
url = "{api_url(service)}",
add_headers(
Accept= "text/csv",
Authorization = "Bearer {tokentext}"
),  
body = '{JSON.stringify(match)}',
content_type_json()
) %&gt;%
content(as = "text") %&gt;%
read.csv(text=.)
  </pre> 
          </CopyBox>
        </TabContent>
        <TabContent>
          <CopyBox text={copyoptions[3].copytext(match, table, r)}>
            <div class="pseudopre">{tokentext}</div>
          </CopyBox>
        </TabContent> 
      </Tabs>

    </Card>
  </Col>
</Row>
<section class="container select-wrapper">
  <div class="row">
    <div class="col-md-7">
      <div class="box">
        <div class="columns select-input-wrapper">
          <div class="column" style="padding-top:0px">
            <div style="margin-bottom:0;height:42px">
              <!-- <Tabs>
                {#each copyoptions as { label, fn }, i}
                  <Tab {label} index={i} onClick={() => (option = copyoptions[i])} />
                {/each}
              </Tabs> -->
            </div>
            <CopyBox text={copytext}>
              {#if option.label == 'download'}
                <input type="text" placeholder="filename.csv" bind:value={filename} />
                <button type="button" class="btn-secondary download" disabled={false} on:click={startDownload}>
                  Download
                  <!-- <span><img alt="" class='icon-download' src='../svg/download-icon.svg'/></span> -->
                </button>
              {:else if option.label == 'mongo query'}
                <pre>{JSON.stringify(match, undefined, 2)}</pre>
              {:else if option.label == 'curl your query'}
                <div class="pseudopre">
                  {curlhead}
                  <span class="hoverer">
                    <span class="hoverhide">&lt your token &gt"</span>
                    <span class="hovershow">{tokentext}"</span>
                  </span>
                  -d '{JSON.stringify(match)}' {api_url(service)}
                </div>
              {:else if option.label == 'R script'}
                <pre
                  id="R"
                  bind:this={r}>
  library(tidyverse)
  library(httr)
  
  mydataframe &lt;- POST(
      url = "{api_url(service)}",
      add_headers(
        Accept= "text/csv",
        Authorization = "Bearer {tokentext}"
        ),  
      body = '{JSON.stringify(match)}',
      content_type_json()
    ) %&gt;%
    content(as = "text") %&gt;%
    read.csv(text=.)
  </pre>
              {:else if option.label == 'just your token'}
                <div class="pseudopre">{tokentext}</div>
              {/if}
            </CopyBox>
          </div>
        </div>
      </div>
      <!-- <button on:click={console.log(match)}>click for console.log(match)</button> -->
    </div>
  </div>
</section>

<style type="text/scss">

  input {
    cursor: pointer;
    display: block;
    font-size: 1em;
    max-width: 100%;
    outline: none;
  }

  .pseudopre {
    word-break: break-all;
    overflow-wrap: break-word;
    width: 90%;
    background-color: #f5f5f5;
    color: #4a4a4a;
    font-family: monospace;
    font-size: 0.875em;
    padding: 1.25rem 1.5rem;
  }

  .hovershow {
    display: none;
  }

  .hoverer:hover {
    .hovershow {
      display: inline;
    }
  }

  .box {
    position: relative;
  }
</style>
