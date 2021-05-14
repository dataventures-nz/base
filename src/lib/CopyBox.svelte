<script>
  import { Button, CardActions, CardText, Icon } from 'svelte-materialify'
  import { mdiContentCopy } from '@mdi/js'
  export let text = null
  // export let downloadable = false

  function putTextOnClipboard() {
    navigator.clipboard.writeText(text)
  }
</script>

  <CardText>
    <slot />
  </CardText>
  {#if text}
    <CardActions style = {"justify-content:flex-end"}>
      <!-- <Button class="ma-1" on:click={putTextOnClipboard}>Copy</Button> -->
      <Button fab size="large" on:click={putTextOnClipboard}>
        <Icon path={ mdiContentCopy } />
      </Button>
    </CardActions>
  {/if}


