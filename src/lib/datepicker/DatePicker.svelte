<script>
  /*usage 
  <DatePicker
  bind:selected={picked date} //
  isAllowed={<function returns true if date is allowed>} />
  */
  import Calendar from './Calendar.svelte'
  import TimePicker from './TimePicker.svelte'
  import * as df from 'date-fns'
  import { TextField, Icon } from 'svelte-materialify'
  import { mdiCalendar } from '@mdi/js'
  import { tick } from 'svelte';


  const monthYear = d => df.format(d,"MMMM yyyy")

  // props
  export let placeholder = "placeholder"
  export let showDays = true
  export let showTime = true
  export let isAllowed = () => true
  export let selected = new Date()
  export let format // a date-fns format string eg "d MMMM yyyy"
  export let outlined = false
  export let dense = false
  export let solo =false
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
  <TextField class="ma-1" 
    {outlined} {dense} {solo} 
    on:focus={onFocus} value={format ? df.format(selected, format) : selected.toDateString()}>
    <div slot="prepend">
      <Icon path={mdiCalendar} />
    </div>
    {placeholder}
  </TextField>
  <div class="s-menu" > 
    <div
      tabindex="-1" 
      style={"display:"+ (showDatePicker? "inline-block":"none")} 
      bind:this={datepicker} 
      on:blur={() => (showDatePicker = true)}>
        <div class="month-name s-item">
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
        {#if showTime}
        <TimePicker />
        {/if}
      </div>
    </div>
  </div>


<style>
  .relative {
    position: relative;
    z-index: 999;
  }
  #prev{
    padding-left:10px;
  }
  #next{
    padding-right:10px;
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
