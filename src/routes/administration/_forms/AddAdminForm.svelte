<script>
  import { addAdmin } from '$lib/api.js'
  import NodeList from '../NodeList.svelte'

  import {TextField, Dialog, Icon} from 'svelte-materialify'
  import { mdiMagnify } from '@mdi/js'
  export let close 
  export let parent
  export let nodes
  export let active
  let filter = ''
  $: filtered_tags = nodes.filter(x => x.type == 'user' && x._id.includes(filter))
</script>

<Dialog class="pa-4 text-center" bind:active>
  <h4>Add an Admin</h4>
  <TextField class="ma-1" outlined dense clearable bind:value={filter}>
    <div slot="prepend">
      <Icon path={mdiMagnify} />
    </div>
    Search
  </TextField>

  <NodeList
    items={filtered_tags}
    on:selectItem={async e => {
      await addAdmin(parent, e.detail._id)
      active = false
      close()
    }}
  />
</Dialog>

