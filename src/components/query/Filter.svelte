<script>
  import { getContext } from "svelte"
	import { onMount, onDestroy, tick } from 'svelte';
  onMount(async () => {await tick(); debounceStore.start() })

  import { createDebounceStore } from './debounceStore.mjs'
//  import { writable } from 'svelte/store'

  const queryRunner = getContext("queryRunner")
  const matchStore = getContext("matchStore")
  export let id  
  export let pipeline
  export let brush = {}
  export let data = new Promise(() => {})

  const debounceStore = createDebounceStore([], queryRunner)
  $: other_matches = Object.keys($matchStore).filter(k => k != id).map(id => ({$match:$matchStore[id]}))
  $: console.log({id, other_matches})
  $: console.log({id, q:[...other_matches, ...pipeline]})
  $: debounceStore.queue([...other_matches, ...pipeline])
  $: data = $debounceStore
  $: matchStore.update(matches => {matches[id] = brush; return matches})

  onDestroy(() => matchStore.update(matches => delete matches[id]))

</script>

<slot {data}></slot>