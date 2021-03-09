<script>
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  import Node from './Node.svelte'
  export let items = []

  const dispatchItemClick = (item) => dispatch('selectItem', item)

</script>

<div style='min-height:20px'>
  {#each items as item(item.id)}
    <Node {item} on:click={dispatchItemClick(item)}/>
  {/each}
</div>
