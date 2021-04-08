<script>
  import { getContext } from 'svelte'

  export let isActive = false
  export let onClick = () => console.log('click')
  export let label
  export let index = 0
  let selected_index = getContext('selected_index')

  $: isActive = index == $selected_index

  let clickfn = () => {
    $selected_index = index
    onClick()
  }
</script>

<a href="#$" class:is-active={isActive} on:click={clickfn}>
  {label}
</a>

<style type="text/scss">
  a {
    flex-grow: 1;
    border: 1px solid #dbdbdb;
    height: inherit;
    display: flex;
    justify-content: center;
    align-items: center;
    text-decoration: none;
  }
  a:visited {
    color: black;
  }
  .is-active {
    border-width: 2px;
    border-bottom-width: 0px;
  }
</style>
