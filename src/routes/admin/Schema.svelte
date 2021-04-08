<script>
  import { updateSchema } from '$lib/api.js'
  export let node_id
  export let schema
  const update = () => updateSchema(node_id, JSON.parse(schema))
</script>

<textarea bind:value={schema} width="100%" /><br /><button on:click={update}>update</button>

<style>
  textarea {
    width: 90%;
    height: 200px;
  }
</style>
