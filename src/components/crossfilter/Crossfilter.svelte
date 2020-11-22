<script>
import { setContext } from "svelte";
import { writable } from "svelte/store";
  export let db = ""
  export let collection = ""  
  const brushStore = writable({})
  export let active = false

  console.log("go!!!!!")
  setContext("brushStore",brushStore)
  setContext("config",{db,collection})
</script>

{#if active}
<slot></slot>
{/if}