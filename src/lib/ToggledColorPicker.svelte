<script>
  export let toggle = false
  export let color = '#eeeeee'
  export let label = 'name'
</script>

<div class="wrapper">
  <div class="flex">
    <input type="checkbox" bind:checked={toggle} />
    <label for="picker">{label} </label>
  </div>
  <div class="color">
    <input type="color" bind:value={color} />
  </div>
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding: 5px;
  }

  .flex {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .color {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }
</style>
