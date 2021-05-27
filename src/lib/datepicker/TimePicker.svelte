<script>
  export let time
  $:console.log({time})
</script>

<div style = "width:100%; display:flex; justify-content:center">
  <input type="time" bind:value = {time}/>
</div>