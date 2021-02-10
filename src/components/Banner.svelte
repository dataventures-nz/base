<script>
  import {logout, userPromise} from './security.mjs'
</script>

<style>
  nav {
    padding:5px;
    background:#0b1736;
    height:42px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items:flex-start;
  }

  .leftitems {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items:flex-start;
    padding-top: 7px;
  }

  .rightitems {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items:flex-start;
    padding-top: 7px;
  }

  .avatar {
    border-radius: 50%;
    height: 1.8rem;
  }

  img {
    height:1.5rem; 
  }

  .logo {
    padding: 0px 10px 0px 8px;
  }

  .item {
    color:white;
    font-size: 1.5rem;
    text-decoration: none;
    padding: 0px 10px 0px 8px;
    cursor: pointer;
  }
  

  .dd{
    background-color: #0b1736;
    z-index: 99;
  }

  .dd p{
    display:contents
    }

  .dd a.item{
    display:none
  }
  .dd:hover a.item{
    display:block;
    font-size: 1.2rem;
  }


  .usr{
    padding: 0px 10px 0px 8px;
  }
</style>

<nav>
  <div class="leftitems">
    <a class="logo" href="/"><img src="svg/DV-logo-Horizontal-reverse.svg" ></a>
    <a class = item href="/user">User</a>
    <a class = item href="/admin">Admin</a>
    <div class = dd>
      <p class = item>Charts</p>
      <a class = item href="/chartbox">Waterfall</a>
      <!-- <a class = item href="/chartbox2">Chart 2</a> -->
      <a class = item href="/chartbox3">Polagraph</a>
      <a class = item href="/linegraph">Simple Line</a>
    </div>
  </div>
  <div class = rightitems>
    <div class='usr'>
        {#await userPromise()}
          <img src='/svg/profile-icon.svg' alt='log out' class='avatar'>
        {:then user}
          <img src={user.picture} on:click={logout} alt='log out' class='avatar'>
        {/await}
    </div>
  </div>
</nav>
