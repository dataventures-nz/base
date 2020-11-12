<script>

  /*usage 
  <DatePicker
  bind:selected={picked date} //
  isAllowed={<function returns true if date is allowed>} />
  */
  import Calendar from "./Calendar.svelte";
  import * as d3 from 'd3'
  import * as dfunc from 'date-fns'


  const monthYear = d3.timeFormat("%B %Y")

  // props
  export let isAllowed = () => true;
  export let selected = new Date();

  // state
  let showDatePicker;
  // handlers
  const onFocus = () => {
    showDatePicker = true;
  };

  let datepicker

  const next = () => selected = dfunc.addMonths(selected,1)
  const prev = () => selected = dfunc.addMonths(selected,-1)
  $:if(datepicker && showDatePicker){datepicker.focus()}

</script>

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
</style>

<div class="relative">
  <input type="text" on:focus={onFocus} value={selected.toDateString()} />
  {#if showDatePicker}
    <div class="box" tabindex=-1 bind:this={datepicker} on:blur={()=>showDatePicker=false}>
      <div class="month-name">
        <div class="center">
          <div on:click={prev}>Prev</div>
        </div>
        <div class="center">{monthYear(selected)}</div>
        <div class="center">
          <div on:click={next}>Next</div>
        </div>
      </div>
      <Calendar
        bind:date={selected} 
        bind:showDatePicker={showDatePicker}
        {isAllowed} />
    </div>
  {/if}
</div>
