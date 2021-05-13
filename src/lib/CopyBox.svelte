<script>
  import { Button, CardActions, CardText } from 'svelte-materialify'
  export let text = null

  function putTextOnClipboard() {
    navigator.clipboard.writeText(text)
  }
</script>

  <CardText>
    <slot />
  </CardText>
  {#if text}
    <CardActions>
      <Button class="ma-1" on:click={putTextOnClipboard}>Copy</Button>
    </CardActions>
  {/if}


