<script>
import Crossfilter from '$components/query/Crossfilter.svelte'
import Filter from '$components/query/Filter.svelte'
let start = new Date(2020,1,6)
let dateBrush = {time:{$gte:start}}
let rtoBrush = {RTO_code:1}
</script>

<Crossfilter db='population' collection='hourly_materialised'>
  <h2>dates</h2>
  <Filter id='date' let:data bind:brush={dateBrush} pipeline={[{$group:{_id:"$time", record_count:{$sum:1}}}]}>
    {#await data then ds}
      {#each ds as d}
        {d}
      {/each}
    {/await}
  </Filter>
  <h2>RTOs</h2>
  <Filter id='rto' let:data bind:brush={rtoBrush} pipeline={[{$group:{_id:"$RTO_code", record_count:{$sum:1}}}]}>
    {#await data then ds}
      {#each ds as d}
        {d} 
      {/each}
    {/await}
  </Filter>
</Crossfilter>