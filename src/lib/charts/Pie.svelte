<script>
  import * as d3 from 'd3'

  /** @type {any} */
  export let data = [1, 1, 1, 1]

  /** @type {function(any):number[]} */
  export let accessor = d => d

  export let outerRadius = 15
  export let innerRadius = 7
  export let colorScale = d3.scaleOrdinal(d3.schemeCategory10)

  const arcs = d3.pie()(accessor(data))
  const arcGenerator = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius)

</script>

<g>
  {#each arcs as arc}
    <path d={arcGenerator(arc)} fill={colorScale(arc.index)} />
  {/each}
</g>
