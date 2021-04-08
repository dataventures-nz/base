<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let item = {};
	export let del = false;
</script>

<span class="{item.type} pill" on:click>
	{item._id}
	{#if del}
		&nbsp;<span style="color:red" on:click={dispatch('delete', { item })}>[X]</span>
	{/if}
</span>

<style>
	.pill {
		border: none;
		color: white;
		padding: 4px 4px;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		margin: 2px 2px;
		cursor: pointer;
		border-radius: 16px;
	}

	.user {
		background: darkblue;
	}

	.tag {
		background: darkgreen;
	}

	.collection {
		background: darkgoldenrod;
	}
</style>
