<script>
  import {updateSchema} from '$components/api.mjs'
  export let node_id
  export let schema
  const update = () => updateSchema(node_id, JSON.parse(schema))
</script>
<textarea bind:value={schema}></textarea><button on:click={update}>update</button>