<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  import {dndzone, TRIGGERS} from 'svelte-dnd-action'
  import Node from './Node.svelte'
  export let items = []
  export let source = true
  export let copy = true
  export let target = true

  let shouldIgnoreDndEvents = false

  function handleDndConsider(e) {
    if (copy) {
      console.warn(`got consider ${JSON.stringify(e.detail, null, 2)}`);
      const {trigger, id} = e.detail.info;
      if (trigger === TRIGGERS.DRAG_STARTED) {
          console.warn(`copying ${id}`);
          const idx = items.findIndex(item => item.id === id);
          const newId = `${id}_copy_${Math.round(Math.random()*100000)}`;
          e.detail.items.splice(idx, 0, {...items[idx], id: newId});
          items = e.detail.items;
          shouldIgnoreDndEvents = true;
      }
      else if (!shouldIgnoreDndEvents) {
          items = e.detail.items;
      }
      else {
          items = [...items];
      }
    } else {
      items = e.detail.items;
    }

  }

  function handleDndFinalize(e) {
    if (copy) {
      console.warn(`got finalize ${JSON.stringify(e.detail, null, 2)}`);
      if (!shouldIgnoreDndEvents) {
          items = e.detail.items;
      }
      else {
          items = [...items];
          shouldIgnoreDndEvents = false;
      }
    } else {
      items = e.detail.items;
    }
  }

  const dispatchItemClick = (item) => dispatch('selectItem', item)

</script>

<div style='min-height:20px' use:dndzone="{{items, dragDisabled:!source, dropFromOthersDisabled:!target}}" on:consider={handleDndConsider} on:finalize={handleDndFinalize}>
  {#each items as item(item.id)}
    <Node {item} on:click={dispatchItemClick(item)}/>
  {/each}
</div>
