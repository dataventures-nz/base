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
  <Chip class="ma-1 {types[item.type].color} lighten-4" close label link on:click>
    <div slot="close-icon">
      {#if del}
        <Icon path={mdiDelete} on:click={() => dispatch('delete', { item })} />
      {/if}
    </div>
    <Icon path={types[item.type].icon} />
    <span>{item._id}</span>
  </Chip>
</div>
