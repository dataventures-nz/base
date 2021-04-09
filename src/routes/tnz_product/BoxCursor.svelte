<script>
  import { getContext, tick, onMount } from 'svelte'
  export let x = 0
  export let content = ['line1', 'a much longer line 2 blah de blah', 'some more content']

  let c = getContext('constants')
  let xScale = c.xScale
  let right = true
  let inner_g
  let lineheight = 0
  let boxwidth = 0
  let boxheight = 0

  $: if (inner_g && inner_g.children[0]) {
    lineheight = inner_g.children[0].getBoundingClientRect().height
  }
  $: rangeend = $xScale.range()[1]
  $: right = x + boxwidth > rangeend
  $: offset = right ? -5 : 5
  $: boxtranslation = right ? x - boxwidth : x

  async function layout() {
    await tick()
    boxheight = inner_g.getBoundingClientRect().height + 10
    boxwidth = inner_g.getBoundingClientRect().width + 10
  }
  onMount(layout)
  $: if (content && inner_g && inner_g.children[0]) {
    layout()
    lineheight = inner_g.children[0].getBoundingClientRect().height
  }
</script>

<g transform={'translate(' + boxtranslation + ',0)'}>
  <rect width={boxwidth} height={boxheight} />
</g>
<g bind:this={inner_g} transform={'translate(' + (x + offset) + ',0)'}>
  {#each content as line, i}
    <text transform={'translate(0,' + lineheight * (i + 1) + ')'} text-anchor={right ? 'end' : 'start'}>
      {line}
    </text>
  {/each}
</g>

<style type="text/scss">
  rect {
    stroke: black;
    fill: aqua;
    fill-opacity: 0.2;
  }
</style>
