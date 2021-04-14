<script>
  import { addAdmin } from '$lib/api.js'
  import NodeList from '../NodeList.svelte'

  export let close
  export let parent
  export let nodes

  let filter = ''
  $: filtered_tags = nodes.filter(x => x.type == 'user' && x._id.includes(filter))
</script>

<input bind:value={filter} />
<NodeList
  items={filtered_tags}
  on:selectItem={async e => {
    await addAdmin(parent, e.detail._id)
    close()
  }}
/>
<button on:click={close}>Close</button>
