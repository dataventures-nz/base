<script>
  import * as security from '$components/security.mjs'
  const {userPromise, tokenPromise} = security
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
