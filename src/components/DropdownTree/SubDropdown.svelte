<script>
  export let group
  export let subgroupaccessor
  export let valueaccessor = d=>d
  export let labelaccessor = d=>d

</script>

<style type="text/scss">

</style>


	{#await subgroupaccessor(group) then items}
		{#each items as item}
		<option class = "option" value={valueaccessor(item)}>
			{labelaccessor(item)}

		</option>
		{/each}
	{:catch err}
		<span color=red>{err}</span>
	{/await}
