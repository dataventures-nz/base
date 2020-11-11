<script>
  import {query} from '$components/api.mjs'
  let date = new Date(2020,10,1)
  console.log("test!")
</script>


{#await query("population","noon_by_rto",[
  {$match:{RTO_code:1, time:{$gte:date}}},
  {$project:{_id:0,updated_from:0}}])}
  waiting....
{:then results}
  {results.length}
{/await}
