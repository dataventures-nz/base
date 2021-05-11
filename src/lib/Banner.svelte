<script>
  import { logout, userPromise } from './security.js'
  import {
    ButtonGroup,
    ButtonGroupItem,
    Tab,
    Tabs,
    Avatar,
    AppBar,
    Button,
    Icon,
    Menu,
    ListItem,
    MaterialApp
  } from 'svelte-materialify'
  import { mdiMenu, mdiDotsVertical } from '@mdi/js'
  import { goto } from '$app/navigation.js'
</script>

<AppBar dense flat tile>
  <span slot="title"><img alt="DataVentures logo" src="svg/DV-logo-Horizontal.svg" height="32px" /></span>
  <div style="flex-grow:1" />
  <ButtonGroup>
    <ButtonGroupItem on:click={() => goto('/administration')}>Admin</ButtonGroupItem>
    <ButtonGroupItem on:click={() => goto('/data')}>Data</ButtonGroupItem>
  </ButtonGroup>
  <div style="flex-grow:1" />

  <Avatar size={36} class="mr-3">
    {#await userPromise()}
      <img src="/svg/profile-icon.svg" alt="log out" />
    {:then user}
      <img src={user.picture} on:click={logout} alt="log out" />
    {/await}
  </Avatar>
</AppBar>
