<script>
  export let time = "00:00"
</script>

<div id = time_wrapper>
  <input type="time"
    bind:value = {time}/>
</div>

<style>
  #time_wrapper{
    width:100%; 
    display:flex; 
    justify-content:center;
    padding-bottom: 5px;
     
  }

  input{
    color: inherit;
    font: inherit;
    border: 1px solid rgb(118, 118, 118);
    padding: 0px 8px 0px 8px;
    border-radius:4px
  }
</style>