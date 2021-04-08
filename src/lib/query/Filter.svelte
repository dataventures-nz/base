<script>
  import { getContext } from 'svelte'
  import { onMount, onDestroy, tick } from 'svelte'
  onMount(async () => {
    await tick()
    debounceStore.start()
  })

  import { createDebounceStore } from './debounceStore.js'

  export let queryRunner = getContext('queryRunner')
  export let matchStore = getContext('matchStore')
  export let id
  export let pipeline
  export let brush = {}
  export let data = new Promise(() => {})
  export let process = d => d
  export let useMatches = true
  export let active = true
  export let pre = []

  const debounceStore = createDebounceStore([], queryRunner)

  $: other_matches = Object.keys($matchStore)
    .filter(k => k != id)
    .map(id => ({ $match: $matchStore[id] }))
  $: if (active && pipeline) {
    if (useMatches) {
      debounceStore.queue([...pre, ...other_matches, ...pipeline])
    } else {
      debounceStore.queue([...pre, ...pipeline])
    }
  }
  $: if (active && pipeline) {
    data = process($debounceStore)
  }
  $: matchStore.update(matches => {
    matches[id] = brush
    return matches
  })

  onDestroy(() => matchStore.update(matches => delete matches[id]))
</script>

<slot {data} />
