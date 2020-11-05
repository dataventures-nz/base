<script>
  import {userPromise, tokenPromise} from '$components/security.mjs'
</script>
{#await userPromise}
Loading user
{:then user}
{JSON.stringify(user)}
{/await}
<br>
<br>
<br>
{#await tokenPromise}
  Loading token
{:then token}
  {token}
{/await}
