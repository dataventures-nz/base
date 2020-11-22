<script>
  import {query} from '$components/api.mjs'
  let start = new Date(2020,10,1)
</script>

{#await query("population","noon_by_rto",[{$match:{RTO_code:1, time:{$gte:start}}}, {$project:{_id:0,updated_from:0}}])}
  waiting....
{:then results}
  {results.length}
{/await}