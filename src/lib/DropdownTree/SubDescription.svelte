<script>
  import { tokenPromise } from '$lib/security.js'
  import * as d3 from 'd3'
  export let endpoint

  async function get(endpoint, service) {
    const data = d3.csv(endpoint + '/' + service, {
      method: 'GET',
      headers: {
        'Access-Control-Allow-Headers': ['Authorization'],
        Authorization: 'Bearer ' + (await tokenPromise)
      }
    })
    return await data
  }

  const subscription = get(endpoint, 'subscription')
</script>

<article class="tile is-child notification">
  <h3>{endpoint}</h3>
  {#await subscription}
    Please wait...
  {:then sub}
    {#each sub as line}
      {JSON.stringify(line)}
    {/each}
  {:catch err}
    <span color="red">{err}</span>
  {/await}
</article>

<style type="text/scss">
  article {
    width: inherit;
  }
</style>
