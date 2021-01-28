<script>
  import {query} from '$components/api.mjs'
  let start = new Date(2021,0,1)
  console.log(start)
</script>

{#await query("population","hourly_materialised",[{$match:{RTO_code:1, time:{$gte:start}}}, {$project:{_id:0,updated_from:0}}])}
  waiting....
{:then results}
  {results.length}
{/await}