<script>
  export let text = null
  let w

  let m = false
  const mouseis = isDown => () => {
    m = isDown
  }

  function putTextOnClipboard() {
    console.log('copied')
    navigator.clipboard.writeText(text)
  }
</script>

<div
  id="outer"
  bind:clientWidth={w}
  on:mousedown={mouseis(true)}
  on:mouseup={mouseis(false)}
  on:click={putTextOnClipboard}
>
  <div id="inner" style="width:{w - 12}px">
    <slot />
  </div>
  {#if text}
    <div class="buttons is-right">
      <button id="copy" class="button is-small" class:m>Copy</button>
    </div>
  {/if}
</div>

<style type="text/scss">
  #outer {
    border: 1px solid #dbdbdb;
    border-top-style: none;
    margin-top: -5px;
    padding-bottom: 5px;
  }

  #inner {
    margin: 5px;
    padding: 5px;
    max-height: 500px;
    overflow: auto;
    position: relative;
    top: 5px;
  }

  .buttons {
    padding: 3px;
    position: relative;
  }

  button {
    transition: background-color 0.2s;
    transition: border 0.2s;
  }

  button.m {
    background-color: #ee6823;
  }
</style>
