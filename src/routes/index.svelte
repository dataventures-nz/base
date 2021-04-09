<script>
  import { userPromise } from '$lib/security.js'
  // import d3format from 'd3-format'
  // console.log(d3format)
</script>

{#await userPromise()}
  loading user
{:then user}
  hi {JSON.stringify(user)}
{/await}
