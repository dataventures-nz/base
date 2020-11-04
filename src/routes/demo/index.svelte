<script>
  import {query} from '$components/api.mjs'
</script>

{#await query("population","noon_by_rto",[{$match:{RTO_code:1}},{$project:{_id:0,updated_from:0}}])}
  waiting....
{:then results}
  {results.length}
{/await}
