<script>
  import Crossfilter from '$lib/query/Crossfilter.svelte'
  import Filter from '$lib/query/Filter.svelte'
  let start = new Date(2020, 1, 6)
  let dateBrush = { time: { $gte: start } }
  let rtoBrush = { sa2_2018_code: 100100 }
</script>

<Crossfilter db="population" collection="hourly_materialised">
  <h2>dates</h2>
  <Filter
    id="date"
    let:data
    bind:brush={dateBrush}
    pipeline={[{ $group: { _id: '$time', record_count: { $sum: 1 } } }]}
  >
    {#await data then ds}
      {#each ds as d}
        {d}
      {/each}
    {/await}
  </Filter>
  <h2>RTOs</h2>
  <Filter
    id="rto"
    let:data
    bind:brush={rtoBrush}
    pipeline={[{ $group: { _id: '$sa2_2018_code', record_count: { $sum: 1 } } }]}
  >
    {#await data then ds}
      {#each ds as d}
        {d}
      {/each}
    {/await}
  </Filter>
</Crossfilter>
