<script>
  import {query,listDatabases} from '$components/api.mjs'
  let start = new Date(2021,1,1)
  console.log(start)
</script>

{#await query("population","hourly_materialised",[{$match:{RTO_code:1, time:{$gte:start}}}, {$project:{_id:0,updated_from:0}}])}
  waiting....
{:then results}
  {results.length}
{/await}
<br>
<br>
<br>
<br>
<br>

{#await listDatabases()}
  loading....  
{:then databases}
  {#each databases as database}
  {database._id} - {database.type}<br>
  {/each}
{/await}
