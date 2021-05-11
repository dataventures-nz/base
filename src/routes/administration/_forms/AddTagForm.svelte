<script>
  import { addLink, addNewTag } from '$lib/api.js'
  import NodeList from '../NodeList.svelte'
  import {TextField, Dialog, Icon, Select, Button} from 'svelte-materialify'
  export let close
  export let parent
  export let nodes
  export let active 

  let filter = ''

  $: canItHappen = parent && filter
  $: filtered_tags = nodes.filter(x => (x.type == 'user' || x.type == 'tag') && x._id.includes(filter))

  const makeItHappen = async () => {
    if (filtered_tags.map(x => x._id).includes(filter)) {
      await addLink(parent, filter)
    } else {
      await addNewTag(parent, filter)
    }
    close()
    active=false
  }
</script>

<Dialog class="pa-4 text-center" bind:active>
  <TextField bind:value={filter} class="ma-1" outlined dense clearable>Tag Name</TextField><br />
  <NodeList items={filtered_tags} on:selectItem={e => (filter = e.detail._id)} />  
  <Button disabled={!canItHappen} on:click={makeItHappen}>Add Tag</Button>
</Dialog>