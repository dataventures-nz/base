<script>
  import * as security from './security.mjs'
  const {auth0Promise, logout} = security
  const userPromise = auth0Promise.then(auth0 => auth0.getUser())
</script>

<style>
  nav {
    padding:5px;
    background:#0b1736;
  }
  .avatar{
    border-radius: 50%;
    height: 2rem;
  }
  .logo{
    height: 2rem;
  }
  a {
    color:white;
    font-size: 2rem;
    text-decoration: none;
  }
  
</style>
<nav>
  <a href="/"><img src="svg/DV-logo-Horizontal-reverse.svg" class="logo"></a>
  <a href="/user">User</a>
  <a href="/admin">Admin</a>
  <a href="/demo">Demo</a>
  <span style="float:right">
    {#await userPromise}
      <img src="/svg/profile-icon.svg" alt="log out" class="avatar">
    {:then user}
      <img src={user.picture} on:click={logout} alt="log out" class="avatar">
    {/await}
  </span>
</nav>
