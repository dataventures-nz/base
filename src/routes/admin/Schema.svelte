<script>
  import {updateSchema} from '$components/api.mjs'
  export let node_id
  export let schema
  const update = () => updateSchema(node_id, JSON.parse(schema))
</script>

<style>
textarea {
  width:90%;
  height:200px;
}
</style>
<textarea bind:value={schema} width=100%></textarea><br><button on:click={update}>update</button>