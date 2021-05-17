<script>
  import { tokenPromise } from '$lib/security.js'
  import { xor_only } from '$lib/map/select_modes.js'
  import QueryMap from './QueryMap.svelte'
  import { download } from '$lib/_utils/download.js'
  import { mappable_fields, time_fields } from '$lib/_utils/schemautils.js'
  import Datepicker from '$lib/datepicker/DatePicker.svelte'
  import CopyBox from '$lib/CopyBox.svelte'
  import { api_url, listDatabases, normalise } from '$lib/api.js'
  import {
    Row,Col,
    Card,CardText,CardActions,
    ButtonGroup, ButtonGroupItem, Button,
    Tabs,Tab,TabContent,
    Icon,
    Select,TextField
  } from 'svelte-materialify'

  import { mdiClose, mdiDownload } from '@mdi/js'

  let datefield
  let collection = undefined
  let startDate
  let endDate
  let filename = 'mydata.csv'
  let match
  let currentlayer = 0
  let selection = []
  let dbfield = ''
  let r
  let table = ''
  let tokentext = 'tokentext'

  function displayname(collection) {
    return collection.db + '/' + collection.collection
  }

  async function get_allowed_db() {
    let collections = await listDatabases()
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
  // option = copyoptions[0]

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
  // $: copytext = option.copytext(match, table, r)

  let dropdownCollection // hack because Materialised Select is a little broken
  $: {
    collection = Array.isArray(dropdownCollection)?undefined:dropdownCollection
  }

  $: if(collection && !collection?.timeFields.includes(datefield)){datefield = ""}
  
  $: noSelection = !(selection.length)

</script>


<Row>
  <Col col={12} md={5}>
    <Card class="ma-2">
      <CardText>
      {#await get_allowed_db() then dbs}
        <Select outlined dense items={dbs} bind:value={dropdownCollection}>First choose a collection to query</Select>
      {/await}
      </CardText>
    </Card>
    {#if collection && collection.mappableFields.length}
    <Card class="ma-2"> 
      <CardText> <p>Optional: Select specific areas</p> 
      <CardActions>
        <div class = buttons>
          <ButtonGroup value = {0}>
              {#if collection}
                {#each collection.mappableFields as layer, i}
                <ButtonGroupItem on:click={() => tabclick(i)}>{layer.map.name}</ButtonGroupItem>
                {/each}
              {/if} 
                
          </ButtonGroup>
          <Button 
            fab 
            size="small" 
            class={noSelection ?"grey white-text":"deep-orange lighten-1 white-text"}
            disabled = {noSelection}  
            on:click={clearmapselection}>
            <Icon path={ mdiClose } />
          </Button>
      </div>  
      </CardActions>  
      <QueryMap
      height="620"
      selectMode={xor_only}
      layerlist={collection ? collection.mappableFields : []}
      bind:selection
      bind:currentlayer
    />
    </CardText>
    </Card> 
    {/if}  
  </Col>
  <Col col={12} md={7}>
    {#if collection && collection.timeFields.length}
    <Card class="ma-2"> 
      <CardActions>
        <Select outlined dense items={collection.timeFields} bind:value={datefield}>Optional: Select time field</Select>
        {#if datefield && datefield.length}
          <Datepicker bind:selected={startDate} placeholder="From Date (Inclusive)" />
          <Datepicker bind:selected={endDate} placeholder="To Date" />
          <!-- <Button class="red white-text right" on:click={cleardateselection}>Clear Selection</Button> -->
          <Button fab size="small" class="deep-orange lighten-1 white-text" on:click={cleardateselection}>
            <Icon path={ mdiClose } />
          </Button>
        {/if} 
      </CardActions> 
    </Card>
    {/if}
    {#if collection}
      <Card class="ma-2">
        <CardText>
        <Tabs grow >
          <div slot="tabs">
            <Tab>Download</Tab>
            <Tab>Mongo query</Tab>
            <Tab>CURL</Tab>
            <Tab>R script</Tab>
            <Tab>Just your token</Tab>
          </div>
          <TabContent class="ma-1">
            <CardActions>
              <TextField class="ma-1" outlined dense bind:value={filename}>Save as</TextField>
              <!-- <Button class="ma-1" on:click={startDownload}>Download</Button> -->
              <Button fab size="small" on:click={startDownload}>
                <Icon path={ mdiDownload } />
              </Button>
            </CardActions>
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
        </CardText>
      </Card>
    {/if}
  </Col>
</Row>

<style type="text/scss">
  
  .dvorange {
  background-color: #F65A00 !important;
  border-color: #F65A00 !important;
  }
  .buttons{
    width:100%;
    display: flex;
    justify-content:space-between
  }

  pre {
    overflow:hidden;
    background-color: #f5f5f5;
    color: #4a4a4a;
    font-family: monospace;
    font-size: 0.875em;
  }

  .pseudopre {
    word-break: break-all;
    overflow-wrap: break-word;
    background-color: #f5f5f5;
    color: #4a4a4a;
    font-family: monospace;
    font-size: 0.875em;
    padding: 1.25rem 1.5rem;
  }

  .hovershow {
    display: none;
  }
  .hoverhide{
      display:inline;
  }

  .hoverer:hover {
    .hovershow {
      display: inline;
    }
    .hoverhide{
      display:none;
    }
  }

</style>
