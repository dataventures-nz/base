<script>
	import {userPromise} from "$components/security.mjs";
</script>

{#await userPromise()}
	loading user
{:then user}
	hi {JSON.stringify(user)}	
{/await}

