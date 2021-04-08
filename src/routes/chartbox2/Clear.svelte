<script>
  export let clearfn = function () {
    console.log(this)
  }
</script>

<div on:click={clearfn}>
  <img src="../svg/remove-icon.svg" alt="Clear Selection" />
</div>

<style>
  div {
    position: absolute;
    right: 20px;
    top: 16px;
    height: 30px;
  }

  img {
    height: 18px;
  }
</style>
