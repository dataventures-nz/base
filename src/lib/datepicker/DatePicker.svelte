<script>
  /*usage 
  <DatePicker
  bind:selected={picked date} //
  isAllowed={<function returns true if date is allowed>} />
  */
  import Calendar from './Calendar.svelte'
  import * as d3 from 'd3'
  import * as df from 'date-fns'

  const monthYear = d3.timeFormat('%B %Y')

  // props
  export let showDays = true
  export let isAllowed = () => true
  export let selected = new Date()
  export let format // a date-fns format string eg "d MMMM yyyy"
  // state
  let showDatePicker
  // handlers
  const onFocus = () => {
    showDatePicker = true
  }

  let datepicker

  const next = () => (selected = df.addMonths(selected, 1))
  const prev = () => (selected = df.addMonths(selected, -1))
  $: if (datepicker && showDatePicker) {
    datepicker.focus()
  }
</script>

<div class="relative">
  <input type="text" on:focus={onFocus} value={format ? df.format(selected, format) : selected.toDateString()} />
  <div class="box" tabindex="-1" style={"display:"+ (showDatePicker? "inline-block":"none")} bind:this={datepicker} on:blur={() => (showDatePicker = false)}>
    <div class="month-name">
      <div class="center">
        <div on:click={prev}>Prev</div>
      </div>
      <div id="monthtext" class="center">{monthYear(selected)}</div>
      <div class="center">
        <div on:click={next}>Next</div>
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
