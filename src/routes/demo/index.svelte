<script>
  import {query} from '$components/api.mjs'
</script>

{#await query("population","noon_by_rto",[
  {$match:{RTO_code:1, time:{$gte:{$date:"2020-10-01T12:00:00Z"}}}},
  {$project:{_id:0,updated_from:0}}])}
  waiting....
{:then results}
  {results.length}
{/await}
