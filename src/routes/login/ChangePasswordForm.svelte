<script>

  import {
    TextField, Dialog, 
    Card, CardText,CardActions, CardTitle,
    Button, Icon 
  } from 'svelte-materialify'

  export let active
  export let webAuth
  export let databaseConnection
  let email = ''
  let success = false

  function sendChangePassword() {
    webAuth.changePassword({
        connection: databaseConnection,
        email: email
      }, function (err, resp) {
        if(err) {
          console.log(err.message);
        } else {
          success = true
        }
      }
    );
  };

  $: if (!active) {
    success = false
    email = ''
    active = false
  }

  const emailRule = [
    (v) => !!v || 'Required',
    (value)=> value.search("@") > -1 || 'Invalid e-mail.'
  ]

</script>

<Dialog class="pa-4 text-center" bind:active>
  <Card>
  <CardTitle>Change your password</CardTitle>
  <CardText>
    <TextField class="ma-2" outlined counter={25} disabled={success} type={'text'} bind:value={email} rules={emailRule}> Email Address</TextField>
  </CardText>
    {#if success}
      <CardText>
        A link to reset your password has been sent to your e-mail address.
      </CardText>
    {:else}
      <CardActions>
        <Button class="ma-2" on:click={sendChangePassword}>Send</Button>
      </CardActions>
    {/if}  
  </Card>
</Dialog>

