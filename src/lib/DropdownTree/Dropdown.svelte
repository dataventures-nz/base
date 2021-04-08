<script>
  import SubDropdown from './SubDropdown.svelte'

  export let whitelist
  export let table
</script>

<!-- svelte-ignore a11y-no-onchange -->
<select name="Choose a table" bind:value={table} class="input" on:change>
  <option selected disabled class="header">Choose a Table</option>
  {#each whitelist as endpoint}
    <optgroup label={endpoint.endpoint}>
      <SubDropdown {endpoint} />
    </optgroup>
  {/each}
</select>
