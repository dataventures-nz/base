<script>
  import {userPromise, tokenPromise} from '$components/security.mjs'
  const putTextOnClipboard = text => navigator.clipboard.writeText(text)

</script>

{#await userPromise()}
  Loading user
{:then user}
  Check..... {JSON.stringify(user)}...
{/await}
<br>
<br>
<br>
{#await tokenPromise()}
  Loading token
{:then token}
  alias durl='curl -H "Authorization: Bearer {token}"'<br>
  <button on:click={putTextOnClipboard(`alias durl='curl -H "Authorization: Bearer ${token}"'`)}>
    durl
  </button>
{/await}
