<script>
  import Banner from '$lib/Banner.svelte'
  import { MaterialApp } from 'svelte-materialify'
</script>

<MaterialApp>
  <Banner />
  <div>
    <slot />
  </div>
</MaterialApp>

<style>
  :global(.s-btn) {
    /* --theme-app-bar: plum; */
  }
</style>