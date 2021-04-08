<script>
	import { addLink, addNewTag } from '$lib/api.js';
	import NodeList from '../NodeList.svelte';

	export let close;
	export let parent;
	export let nodes;

	let filter = '';

	$: canItHappen = parent && filter;
	$: filtered_tags = nodes.filter(
		(x) => (x.type == 'user' || x.type == 'tag') && x._id.includes(filter)
	);

	const makeItHappen = async () => {
		if (filtered_tags.map((x) => x._id).includes(filter)) {
			console.log('add link', parent, filter);
			await addLink(parent, filter);
		} else {
			console.log('add new tag', parent, filter);
			await addNewTag(parent, filter);
		}
		close();
	};
</script>

<input bind:value={filter} />
<NodeList items={filtered_tags} on:selectItem={(e) => (filter = e.detail._id)} />

<button disabled={!canItHappen} on:click={makeItHappen}>Make it so</button><br />
<button on:click={close}>Nope right on out of there</button>
