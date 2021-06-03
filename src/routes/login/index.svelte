<script>
  import {
    Row,Col,
    Card,CardText,CardActions,
    ButtonGroup, ButtonGroupItem, Button,
    Icon,
    TextField
    } from 'svelte-materialify'
  import { mdiEyeOff, mdiEye, mdiCardText } from '@mdi/js';  
  import {WebAuth} from 'auth0-js'
  import auth_config from '$lib/auth_config.json'
  import ChangePasswordForm from './ChangePasswordForm.svelte';
  
  let show = false
  let password = ''
  let username = ''
  let email = ''
  let error = ''
  let changingPassword = false

  const auth_params = {
    clientID: auth_config.client_id,
    responseType:'token',
    ...auth_config
  } 
  const webAuth = new WebAuth(auth_params);

  var databaseConnection = 'Username-Password-Authentication';

  function login() {
    webAuth.login({
      realm: databaseConnection,
      username: username,
      password: password
    }, function(err) {
      console.log('login ',err)
      if (err) displayError(err);
    });
  }
  function signup() {
    webAuth.redirect.signupAndLogin({
      connection: databaseConnection,
      email: email,
      password: password
    }, function(err) {
      console.log('signup ',err)
      if (err) displayError(err);
    });
  }
  function loginWithGoogle() {
    console.log("google")
    webAuth.authorize({
      connection: 'google-oauth2'
    }, function(err) {
      if (err) displayError(err);
      console.log("error with google",err)
    });
  }
  function displayError(err) {
    error = err.description
  }

</script>

<Row>
  <Col cols={12} offset={3} md={6}>
    <Card class="ma-2">
      <CardText>
        <h2> Sign into Data Ventures</h2>
        <TextField class="ma-2" outlined  type={'text'} bind:value={username}> Email Address</TextField>
        <TextField class="ma-2" outlined  type={show ? 'text' : 'password'} bind:value={password}>
          Password
          <div
            slot="append"
            on:click={() => {
              show = !show;
            }}>
            <Icon path={show ? mdiEyeOff : mdiEye} />
          </div>
        </TextField>
      </CardText>
      <CardActions>
        <div class="d-flex justify-space-between align-end" style="width:100%">
          <Button on:click={login}>Sign in</Button>
          <Button on:click={signup}>Sign up</Button>
          <Button on:click={loginWithGoogle}>Sign in with Google</Button>
          <Button on:click={()=>{changingPassword=true}} size="x-small" class="grey white-text">forgot your password?</Button>
        </div>
      </CardActions>
      {#if error}
      <CardText>
        {error}
      </CardText>
      {/if}
    </Card>
  </Col>
</Row>
<ChangePasswordForm {webAuth} {databaseConnection} bind:active = {changingPassword}></ChangePasswordForm> 


  