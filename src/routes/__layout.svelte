<script>
  import Banner from '$lib/Banner.svelte'
  import { MaterialApp } from 'svelte-materialify'
</script>

<MaterialApp>
  <Banner />
  <slot />
</MaterialApp>
