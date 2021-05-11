<script>
  import { addCollection } from '$lib/api.js'
  import {TextField, Dialog, Icon, Select, Button} from 'svelte-materialify'
  export let admin
  export let close
  export let active
  let db
  let collection
  $: canItHappen = db && collection
  const makeItHappen = async () => {
    await addCollection(db, collection)
    close()
    active=false
  }

</script>

<Dialog class="pa-4 text-center" bind:active>
  <h4>Add New Collection</h4>
  <Select bind:value={db} outlined dense items={admin.canAddCollectionTo}>Database</Select><br />

  <TextField bind:value={collection} class="ma-1" outlined dense clearable>Collection Name</TextField><br />
  <Button disabled={!canItHappen} on:click={makeItHappen}>Add Collection</Button>
</Dialog>
