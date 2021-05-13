<script>
  /*usage 
  <DatePicker
  bind:selected={picked date} //
  isAllowed={<function returns true if date is allowed>} />
  */
  import Calendar from './Calendar.svelte'
  import * as df from 'date-fns'
  import { TextField } from 'svelte-materialify'
import { tick } from 'svelte';


  const monthYear = d => df.format(d,"MMMM yyyy")

  // props
  export let placeholder = "placeholder"
  export let showDays = true
  export let isAllowed = () => true
  export let selected = new Date()
  export let format // a date-fns format string eg "d MMMM yyyy"
  // state
  let showDatePicker
  // handlers
  const onFocus = async () => {
    showDatePicker = true
    await tick()
    datepicker.focus()
  }

  let datepicker

  const next = () => (selected = df.addMonths(selected, 1))
  const prev = () => (selected = df.addMonths(selected, -1))

</script>

<div class="relative">
  <TextField class="ma-1" outlined dense on:focus={onFocus} value={format ? df.format(selected, format) : selected.toDateString()}>{placeholder}</TextField>
  <div class="box" tabindex="-1" style={"display:"+ (showDatePicker? "inline-block":"none")} bind:this={datepicker} on:blur={() => (showDatePicker = false)}>
    <div class="month-name">
      <div class="center">
        <div id = prev on:click={prev}>Prev</div>
      </div>
      <div id="monthtext" class="center">{monthYear(selected)}</div>
      <div class="center">
        <div id = next on:click={next}>Next</div>
      </div>
    </div>
    {#if showDays}
      <Calendar bind:date={selected} {isAllowed} />
    {/if}
  </div>
</div>

<style>
  .relative {
    position: relative;
  }
  #prev{
    padding-left:10px;
  }
  #next{
    padding-right:10px;
  }
  .box {
    position: absolute;
    top: 40px;
    left: 0px;
    border: 1px solid green;
    display: inline-block;
    z-index: 999;
    background-color: whitesmoke;
  }

  .month-name {
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin: 6px 0;
  }

  .center {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #monthtext {
    width: 200px;
    white-space: nowrap;
  }
</style>
