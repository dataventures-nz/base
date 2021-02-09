<script>
  import { setContext } from "svelte";
  import { writable } from 'svelte/store';
  import {queryRunnerFor, db_url} from '../api.mjs'
  export let db
  export let collection
  const matchStore = writable({})
  setContext("queryRunner", queryRunnerFor(db_url(db,collection)))
  setContext("matchStore", matchStore)
</script>

<slot></slot>