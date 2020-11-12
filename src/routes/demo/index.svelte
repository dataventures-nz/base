<script>
  import {query} from '$components/api.mjs'
</script>

  {#await query("population","noon_by_rto",{time:{$gte:{$date:"2020-10-01T12:00:00Z"}}})}
  waiting....
{:then results}
  {JSON.stringify(results)}
{/await}
