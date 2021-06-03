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

  let day = df.startOfDay(selected)
  let time = df.format(selected,"HH:mm")

  const next = () => (day = df.addMonths(day, 1))
  const prev = () => (day = df.addMonths(day, -1))
  
  $:if(time || day){
    const t = time.split(':')
    selected = df.set(day,{hours:+t[0],minutes:+t[1]})
  }

</script>

<div class="relative" id='top'>
  <TextField class="ma-1" 
    {outlined} {dense} {solo} value={format ? df.format(selected, format) : selected.toDateString()}>
    <div slot="prepend">
      <Icon path={mdiCalendar} />
    </div>
    {placeholder}
  </TextField>
  <div class="s-menu" > 
    <div class="month-name s-item">
        <div class="center">
          <div id = prev on:click={prev}>Prev</div>
        </div>
        <div id="monthtext" class="center">{monthYear(day)}</div>
        <div class="center">
          <div id = next on:click={next}>Next</div>
        </div>
      </div>
      {#if showDays}
        <Calendar bind:date={day} {isAllowed} />
      {/if}
      {#if showTime}
        <TimePicker bind:time={time} />
      {/if}
    </div>
  </div>


<style>
  #top .s-menu{
    display:none
  }

  #top:focus-within .s-menu{
    display:inline-block
  }

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
