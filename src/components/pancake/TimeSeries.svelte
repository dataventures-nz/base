<script>
  import * as d3 from 'd3'
  import Filter from '$component/query/Filter.svelte'
  import XAxis from '$component/query/XAxis.svelte'
  export let dateField = 'date'
  export let dateBrush
  export let pipeline
  export let timeScale = d3.scaleTime()
  export let height
  export let width

  const recalcX = (data) => {
    timeScale.domain([d3.min(data), d3.max(data)])
  } 

</script>



<style>

</style>

<div class="chart">
  <Filter id='date' bind:brush={dateBrush} {pipeline} let:data>
    {#await data then ds}
      {recalcX(ds)}
      <XAxis data={ds.map(x => x[dateField])} width={width}/>
    {/await}
  </Filter>
</div>