<script>
  import * as df from 'date-fns'

  // props
  export let date
  export let isAllowed = () => true

  // local vars to help in render
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  let firstofmonth, lastofmonth, sunday, lastday, dayarray

  $: firstofmonth = df.startOfMonth(date)
  $: lastofmonth = df.endOfMonth(date)
  $: sunday = df.startOfWeek(firstofmonth)
  $: {
    // 35 or 42 days in the calendar grid.
    lastday = df.addDays(sunday, 34)
    while (df.format(lastday, 'yyyyMMdd') < df.format(lastofmonth, 'yyyyMMdd')) {
      lastday = df.addDays(lastday, 7) //try 34 days, if that doesn't take us far enough, add another 7
    }
    dayarray = df.eachDayOfInterval({ start: sunday, end: lastday })
  }

  // const clickhandler = (day) => isAllowed(day) && date = day

</script>

<div class="container">
  <div class="row">
    {#each weekdays as day}
      <div class="cell">{day}</div>
    {/each}
  </div>

  <div class="row" style="padding-bottom:10px">
    {#each dayarray as day}
      <div
        on:click={() => {
          if (isAllowed(day)) {
            date = day
          }
        }}
        class:cell={true}
        class:highlight={isAllowed(day)}
        class:disabled={!isAllowed(day)}
        class:selected={+day == +df.startOfDay(date)}
        class:notthismonth={day.getMonth() != date.getMonth()}
      >
        {day.getDate()}
      </div>
    {/each}
  </div>
</div>

<style type="text/scss">
  .cell {
    display: inline-block;
    text-align: center;
    border: 2px solid white;
    padding: 2px;
    margin: 1px;
  }
  .container {
    display: flex;
    flex-direction: column;
    width: auto;
    padding: 0px 20px 0px 20px;
  }
  .row {
    display: grid;
    grid-template-columns: 14% 14% 14% 14% 14% 14% 14%;
  }
  .selected {
    background: var(--theme-tables-active);
    border: 2px solid var(--theme-tables-hover);
  }
  .highlight {
    transition: transform 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
  }
  .notthismonth {
    color: thistle;
  }
  .highlight:hover {
    background: var(--theme-tables-hover);
    border: 2px solid var(--theme-tables-hover);
    cursor: pointer;
  }

  // .selected.highlight:hover {
  //   background: yellowgreen;
  // }

  .disabled {
    background: #bbb;
    cursor: not-allowed;
    color: #999;
  }
</style>
