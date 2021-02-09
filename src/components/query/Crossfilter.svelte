<script>
  import { setContext } from "svelte";
  import { writable } from 'svelte/store';
  import {queryRunnerFor, db_url} from '../api.mjs'
  export let db
  export let collection
  const matchStore = writable({})
  matchStore.subscribe((s) => console.log("matchStore",s))
	import { beforeUpdate, afterUpdate, onMount, onDestroy, tick } from 'svelte';
  onMount(async () => {console.log("mounted"); await tick(); console.log("ticked!") })
  onDestroy(() => {console.log("distroyed")})
  afterUpdate(() => {console.log("updated")})
  beforeUpdate(() => {console.log("thinkin about updating")})

  setContext("queryRunner", queryRunnerFor(db_url(db,collection)))
  setContext("matchStore", matchStore)
</script>

<slot></slot>