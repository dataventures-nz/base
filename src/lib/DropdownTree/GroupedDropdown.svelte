<script>
  import SubDropdown from './SubDropdown.svelte'

  export let groups
  export let groupaccessor = d => d
  export let subgroupaccessor //function that accepts a group and returns an array of entries for each group
  export let valueaccessor = d => d
  export let labelaccessor = d => d
  export let placeholder = 'default dropdown'
  export let value
  export let onChange = () => console.log('dropdown ' + placeholder + ' changed')

  let blacklist = group => ['admin', 'config', 'control', 'local', 'log'].findIndex(d => d == group) != -1
</script>

<!-- svelte-ignore a11y-no-onchange -->
<select name="Choose a table" bind:value class="input" on:change={onChange}>
  {#if placeholder}
    <option selected disabled class="header">{placeholder}</option>
  {/if}
  {#each groups as group}
    {#if !blacklist(groupaccessor(group))}
      <optgroup label={groupaccessor(group)}>
        <SubDropdown group={groupaccessor(group)} {subgroupaccessor} {valueaccessor} {labelaccessor} />
      </optgroup>
    {/if}
  {/each}
</select>
