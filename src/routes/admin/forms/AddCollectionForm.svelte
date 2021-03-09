<script>
  import {addCollection} from '$components/api.mjs'
  export let admin
  export let close
  let db
  let collection
  $: canItHappen = db && collection
  const makeItHappen = async () => { await addCollection(db,collection); close() }
</script>

<select bind:value={db}>
  {#each admin.canAddCollectionTo as dbs}
    <option value={dbs}>{dbs}</option>
  {/each}
</select><br>

<input type=text bind:value={collection}/><br>
<button on:click={makeItHappen}>Make it so</button><br>
<button disabled={!canItHappen} on:click={close}>Nope right on out of there</button>
