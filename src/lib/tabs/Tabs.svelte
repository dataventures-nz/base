<script>
  import { writable } from 'svelte/store'
  import { setContext } from 'svelte'
  export const selected_index = writable(0)
  setContext('selected_index', selected_index)
</script>

<div>
  <slot />
</div>

<style type="text/scss">
  div {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    height: inherit;
  }
</style>
