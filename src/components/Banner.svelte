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
    align-items:center;
  }

  .leftitems {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items:center;
  }

  .rightitems {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items:center;
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

  a.item {
    color:white;
    font-size: 1.5rem;
    text-decoration: none;
    padding: 0px 10px 0px 8px;
    cursor: pointer;
  }
  
  .usr {
    padding: 0px 10px 0px 8px;
  }
</style>

<nav>
  <div class='leftitems'>
    <a class='logo' href='/'><img alt='DV logo' src='svg/DV-logo-Horizontal-reverse.svg' ></a>
    <a class = item href='/user'>User</a>
    <a class = item href='/admin'>Admin</a>
    <a class = item href='/data'>Data</a>
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
