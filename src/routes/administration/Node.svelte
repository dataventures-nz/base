<script>
  import { createEventDispatcher } from 'svelte'
  import { Chip, Icon, Avatar, MaterialApp } from 'svelte-materialify'
  import { mdiAccount, mdiDatabase, mdiTag, mdiDelete } from '@mdi/js'
  export let item = {}
  export let del = false

  const dispatch = createEventDispatcher()

  const types = {
    user: { color: 'indigo', icon: mdiAccount },
    tag: { color: 'blue-grey', icon: mdiTag },
    collection: { color: 'orange', icon: mdiDatabase }
  }
</script>

<div style="display:inline-block;">
  <Chip class="ma-1 {types[item.type].color} lighten-4" label link on:click>
    <Icon path={types[item.type].icon} />
    <span>{item._id}</span>
    {#if del}
      <span on:click|stopPropagation={(e) => dispatch('delete', { item })}><Icon path={mdiDelete}/></span>
    {/if}
  </Chip>
</div>
