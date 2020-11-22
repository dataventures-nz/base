<script context="module">
  import * as security from '$components/security.mjs'
</script>
<script>
  import Banner from '$components/Banner.svelte'
</script>
<style>
	:root {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
	}
</style>
<Banner/>
<slot></slot>
