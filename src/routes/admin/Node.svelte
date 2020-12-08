<script>
  export let item = {}
</script>

<style>
  .pill {
    border: none;
    color: white;
    padding: 4px 4px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    margin: 2px 2px;
    cursor: pointer;
    border-radius: 16px;
  }

  .user {
    background: darkblue;
  }

  .tag {
    background: darkgreen;
  }

  .collection {
    background: darkgoldenrod;
  }
</style>

<span class='{item.type} pill' on:click>{item._id}</span>