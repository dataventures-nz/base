<script>
  import { tokenPromise } from '$lib/security.js'
  import * as d3 from 'd3'
  export let endpoint

  // import { createEventDispatcher } from 'svelte';
  // const dispatch = createEventDispatcher();

  async function get(endpoint, service) {
    const _data = d3.csv(endpoint + '/' + service, {
      method: 'GET',
      headers: {
        'Access-Control-Allow-Headers': ['Authorization'],
        Authorization: 'Bearer ' + (await tokenPromise)
      }
    })

    let data = await _data
    return [...new Set(data)] //uniques data
  }

  async function getlist() {
    let list
    if (endpoint.tables && endpoint.tables.length) {
      list = endpoint.tables.map(t => ({ label: t, value: { endpoint, table: t } }))
    } else {
      const s = await get(endpoint.endpoint, 'subscription')
      list = s.map(d => {
        return { label: d.table, value: { endpoint, table: d.table } }
      })
    }
    return list
  }

  const list = getlist()
  console.log(list)
</script>

{#await list then sub}
  {#each sub as d}
    <option class="option" value={d.value}>
      {d.label}
    </option>
  {/each}
{:catch err}
  <span color="red">{err}</span>
{/await}

<style type="text/scss">
</style>
