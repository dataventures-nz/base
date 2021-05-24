<script>
  import {
    Row,Col,
    Card,CardText,CardActions,CardTitle,
    ListItem,
    Select,
    Table
    } from 'svelte-materialify';
    import { browser } from '$app/env';
    import { listDatabases, listCollections, query } from '$lib/api.js'

  const columns=[
    "_id",
    "db",
    "collection",
    // "requested",
    "status",
    "user_id",
    "time"
  ]

 

  async function collections(){
    const list = await listDatabases()
    let dbs = [...new Set(list.map(d=>d.db))] 
    let cols = [...new Set(list.map(d=>d.collection))]
    return {dbs,collections:cols}
  } 


  let log
  let clicked = null

  function activateRow(thislog,i){
    log = thislog
    clicked = i
  }

   
  let dblist
  let collectionlist,status
  $: console.log(dblist)

  // let q =[{ $sort: { 'time': -1 } }, { $limit: 10 }] 

  function filteredQuery(dblist,collectionlist,status){  
    let filter = {}
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
    console.log(JSON.stringify(q,null,2)) 
    return q
  }

  $:data = query('log', 'query_log',filteredQuery(dblist,collectionlist,status))
  let lists = collections()

</script>
<Row>
  <Col cols={12} md={12}>
    <Card class="ml-16 mr-16 mt-2">
      <CardText>
      {#if browser}
      <Table outlined>
        <!-- <table> -->
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
              <!-- <th>requested</th> -->
              <th>
                <Select dense items={["will run","won't run"]} bind:value={status}>
                  status
              </Select>
              </th>
              <th>user_id</th>
              <th>time</th>


            {/await}
          </tr>
        </thead>
        {#await data}
        wait for it....
        {:then logs}   
        <tbody>
          {#each logs as log,i}
            <tr class={i==clicked?"active":""} on:click={()=>activateRow(log,i)}>
              {#each columns as column}
                <td><div>{log[column]}</div></td>
              {/each}
            </tr>
            {/each}
          
        </tbody>
        {/await}
      <!-- </table> -->
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
      
        <ListItem> time: {log.time}</ListItem>
        <ListItem> db: {log.db}</ListItem>
        <ListItem> collection: {log.collection}</ListItem>
        <ListItem> status: {log.status}</ListItem>
        <ListItem> user: {log.user_id}</ListItem>
      
    </CardText>
    {/if}
    </Card>
  </Col>
  <Col cols={12} md={4}> 
      <Card>
        <CardTitle>Query</CardTitle>
        <CardText>

            <pre>
              {JSON.stringify(JSON.parse(log.query),null,2)}
            </pre>

        </CardText>
      </Card>
    </Col>
    <Col cols={12} md={4}> 
      <Card>
        <CardTitle>Requested</CardTitle>
        <CardText>
            <pre>
              {JSON.stringify(JSON.parse(log.requested),null,2)}
            </pre>
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
    height:25px;
    width: 15%;
    div{
      white-space: nowrap;
      width:100%;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
  .active{
    background: var(--theme-tables-hover);
  }
</style>
