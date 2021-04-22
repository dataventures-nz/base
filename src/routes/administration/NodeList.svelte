<script>
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  import Node from './Node.svelte'
  export let items = []
  export let del = false
  
</script>

<div style="min-height:20px">
  {#each items as item (item._id)}
    <Node {item} {del} on:delete on:click={() => dispatch('selectItem', item)} />
  {/each}
</div>
