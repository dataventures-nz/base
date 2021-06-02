<script>
  import {
    Row,Col,
    Card,CardText,CardActions,CardTitle,
    ListItem,
    Select,TextField,Icon,
    Table
    } from 'svelte-materialify';
    import { mdiMagnify } from '@mdi/js'
    import { browser } from '$app/env';
    import { listDatabases, query, admin_url, fetch_json } from '$lib/api.js'
    import Datepicker from '$lib/datepicker/DatePicker.svelte'
    import * as df from 'date-fns'

  const columns=[
    "_id",
    "db",
    "collection",
    "user_id",
    "time",
    "status"
  ]
  let namefilter
  let timefilter
  $: console.log({namefilter})
  let log
  let clicked = null

  async function collections(){
    const list = await listDatabases()
    let dbs = [...new Set(list.map(d=>d.db))] 
    let cols = [...new Set(list.map(d=>d.collection))]
    return {dbs,collections:cols}
  } 

  const sortByName = (a, b) => a._id.localeCompare(b._id)

  let nameList = []

  const getData = () =>
    fetch_json('GET', admin_url(''))
      .then(x=>x.filter(d=>d._id.includes('@')))
      .then(x =>
        x.sort(sortByName).map(x => {
          x.id = x._id
          return x
        })
      )
      .then(x => (nameList = x))
  getData()
  
  $: filteredNameList = nameList.filter(d=>d._id.includes(namefilter))
  $: console.log({nameList,filteredNameList})


  function activateRow(thislog,i){
    log = thislog
    clicked = i
  }
  
  let dblist
  let collectionlist,status

  function filteredQuery(dblist,collectionlist,status,filteredNameList,timefilter){  
    let filter = {}

    console.log({2:timefilter})

    if(timefilter){
      filter.time = { "$lte": df.endOfDay(timefilter) }
    }
     
    if(filteredNameList && filteredNameList.length){
      filter.user_id = {"$in": filteredNameList.map(d=>d._id)}}

    if(dblist && dblist.length){
      filter.db = {"$in": dblist}}
    if(collectionlist && collectionlist.length){
      filter.collection = {"$in": collectionlist}
    }
    if(status && status.length){
      filter.status = status
    }
    let q = []
    if(Object.entries(filter).length){
      q.push({$match:filter})
    }
    q.push({ $sort: { 'time': -1 } },{ $limit: 10 })
    return q
  }

  $:data = query('log', 'query_log',filteredQuery(dblist,collectionlist,status,filteredNameList,timefilter))
  
  let lists = collections()
  

</script>
<Row>
  <Col cols={12} md={12}>
    <Card class="ml-16 mr-16 mt-2">
      <CardText>
      {#if browser}
      <Table outlined>
        <thead>
          <tr>
            {#await lists}
            {#each columns as column}
              <th>{column}</th>
            {/each}
            {:then c}
              <th>_id</th>
              <th>
                <Select multiple dense items={c.dbs} bind:value={dblist}>
                  db
              </Select>
              </th>
              <th>
                <Select multiple dense items={c.collections} bind:value={collectionlist}>
                  collection
                </Select>
              </th>
              <th>
                <TextField class="ma-1" dense clearable bind:value={namefilter}>
                  <div slot="prepend">
                    <Icon path={mdiMagnify} />
                  </div>
                  user_id
                </TextField>
              </th>
              <th><Datepicker dense 
                bind:selected={timefilter}
                isAllowed = {(date)=>date<new Date()} 
                placeholder="From time" /></th>
              <th>
                <Select dense items={["will run","won't run"]} bind:value={status}>
                  status
              </Select>
              </th>
            {/await}
          </tr>
        </thead>
        <tbody>
          {#each new Array(10).fill(0) as j,i}
          {#await data}
          <tr >
            {#each columns as column}
              <td><div> </div></td>
            {/each}
          </tr>
          {:then logs} 
            <tr class={i==clicked?"active":""} on:click={logs[i]?()=>activateRow(logs[i],i):()=>{}}>
              {#each columns as column}
                <td><div>{logs[i]?logs[i][column]:''}</div></td>
              {/each}
            </tr>
            {/await}
            {/each}
        </tbody>
      </Table>
      {/if}
    </CardText>
    </Card>
  </Col>
</Row>

{#if log}
<Row class = "pl-16 pr-16">
  <Col cols={12} md={4}>
    <Card>
      {#if log}
    <CardTitle>Log ID: {log._id} </CardTitle>
    
      <CardText>
        <div class = "querybox">
          <ListItem> time: {log.time}</ListItem>
          <ListItem> db: {log.db}</ListItem>
          <ListItem> collection: {log.collection}</ListItem>
          <ListItem> status: {log.status}</ListItem>
          <ListItem> user: {log.user_id}</ListItem>
        </div>
      </CardText>
    {/if}
    </Card>
  </Col>
  <Col cols={12} md={4}> 
    <Card>
      <CardTitle>Requested</CardTitle>
      <CardText>
        <div class = "querybox">
          <pre>
            {JSON.stringify(JSON.parse(log.requested),null,2)}
          </pre>
        </div>
      </CardText>
    </Card>
  </Col>
  <Col cols={12} md={4}> 
      <Card>
        <CardTitle>Query</CardTitle>
        <CardText>
          <div class = "querybox">
            <pre>
              {JSON.stringify(JSON.parse(log.query),null,2)}
            </pre>
          </div>
        </CardText>
      </Card>
    </Col>
    
  </Row>
  {/if} 


<style type="text/scss">
  th{
    height:55px;
    width: 15%;
  }

  td{
    height:29px;
    width: 15%;
    div{
      white-space: nowrap;
      width:100%;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
  .active{
    // background: var(--theme-tables-hover);
  }

  .querybox{
    height:300px;
    overflow:auto;
  }
</style>
