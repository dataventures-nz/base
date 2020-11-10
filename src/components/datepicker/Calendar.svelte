<script>
  import * as dfunc from 'date-fns'

//  console.log(dfunc)
  // const dispatch = createEventDispatcher();

  // props
  export let date;
  export let isAllowed;

  // local vars to help in render
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  
  let firstofmonth,lastofmonth, sunday, lastday, dayarray 
  
  console.log(dfunc)

  $: firstofmonth = dfunc.startOfMonth(date)
  $: lastofmonth = dfunc.endOfMonth(date)
  $: sunday = dfunc.startOfWeek(firstofmonth) 
  $: {// 35 or 42 days in the calendar grid. 
      lastday = dfunc.addDays(sunday,34)
        while(dfunc.format(lastday,"yyyyMMdd") < dfunc.format(lastofmonth,"yyyyMMdd")){
          lastday=dfunc.addDays(lastday,7) //try 34 days, if that doesn't take us far enough, add another 7
        }
      dayarray = dfunc.eachDayOfInterval({start:sunday,end:lastday})
      } 

</script>

<style>
  .container {
    margin-top: 8px;
    padding: 6px;
    width: 370px;
  }
  .row {
    display: flex;
    margin: 2px 6px;
    flex-wrap: wrap;
  }

  .cell {
    display: inline-block;
    width: 40px;
    height: 20px;
    text-align: center;
    padding: 4px;
    margin: 1px;
  }

  .selected {
    background: #84e791;
  }

  .highlight {
    transition: transform 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
  }

  .notthismonth{
    color:thistle
  }

  .disabled {
    background: #efefef;
    cursor: not-allowed;
    color: #bfbfbf;
  }

  .highlight:hover {
    background: rgb(238, 176, 60);
    color: #fff;
    cursor: pointer;
    transform: scale(1.3);
  }

  .selected.highlight:hover {
    background: yellowgreen;
  }
</style>

<div class="container">
  <div class="row">
    {#each weekdays as day}
      <div class="cell">{day}</div>
    {/each}
  </div>

  <div class="row">
    {#each dayarray as day}
      <div
        on:click={() => date = day}
        class:cell={true}
        class:highlight={true}
        class:disabled={!isAllowed(day)}
        class:selected={+day==+date}
        class:notthismonth={day.getMonth()!=date.getMonth()}>
        {day.getDate()}
      </div>
    {/each}
  </div>
</div>
