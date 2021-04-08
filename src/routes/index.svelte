<script>
	import { userPromise } from '$lib/security.js';
</script>

{#await userPromise()}
	loading user
{:then user}
	hi {JSON.stringify(user)}
{/await}
