<script>
  import { userPromise, tokenPromise } from '$lib/security.js'
  /** @type{function(string):Promise<void>}*/
  const putTextOnClipboard = text => navigator.clipboard.writeText(text)
  import { mdiEmailOutline, mdiAccountBox, mdiGavel, mdiAccount } from '@mdi/js'
  import { mdiClipboardText } from '@mdi/js'
  import { mdiCalendar } from '@mdi/js'

  import {
    Snackbar,
    List,
    TextField,
    Card,
    CardActions,
    CardText,
    CardTitle,
    CardSubtitle,
    AppBar,
    Button,
    Icon,
    Menu,
    ListItem,
    MaterialApp
  } from 'svelte-materialify'

  let snackbar = false
</script>

{#await userPromise()}
  Loading user
{:then user}
  <div class="d-flex justify-center mt-4 mb-4">
    <Card>
      <CardTitle>{user.nickname}</CardTitle>
      <CardText>
        <List>
          <ListItem>
            <span slot="prepend">
              <Icon path={mdiEmailOutline} />
            </span>
            {user.email}
          </ListItem>
          <ListItem>
            <span slot="prepend">
              <Icon path={mdiCalendar} />
            </span>
            {user.updated_at}
          </ListItem>
        </List>
      </CardText>
      <CardActions>
        {#await tokenPromise() then token}
          <Button
            text
            class="primary-text"
            on:click={() => {
              putTextOnClipboard(`alias durl='curl -H "Authorization: Bearer ${token}"'`)
              snackbar = true
            }}
          >
            <Icon path={mdiClipboardText} class="mr-3" />
            Copy Durl Command To Clipboard
          </Button>
        {/await}
      </CardActions>
    </Card>
  </div>

  <Snackbar class="justify-space-between" center bottom timeout={3000} bind:active={snackbar}>
    Copied to Clipboard
    <Button
      text
      on:click={() => {
        snackbar = false
      }}
    >
      Dismiss
    </Button>
  </Snackbar>
{/await}
