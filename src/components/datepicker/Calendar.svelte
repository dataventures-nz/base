<script>
  import * as dfunc from 'date-fns'

//  console.log(dfunc)
  // const dispatch = createEventDispatcher();

  // props
  export let date;
  export let isAllowed = ()=>true

  // local vars to help in render
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  
  let firstofmonth,lastofmonth, sunday, lastday, dayarray 
  
  // console.log(dfunc)

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

  // const clickhandler = (day) => isAllowed(day) && date = day    

</script>

<style>
  .container {
    margin-top: 8px;
    padding: 6px;
    width: 320px;
  }
  .row {
    display: flex;
    margin: 2px 6px;
    flex-wrap: wrap;
  }

  .cell {
    display: inline-block;
    height: 30px;
    text-align: center;
    padding: 4px;
    margin: 1px;
    flex-basis:13%
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
  .highlight:hover {
    background: rgb(238, 176, 60);
    color: #fff;
    cursor: pointer;
    transform: scale(1.3);
  }

  .selected.highlight:hover {
    background: yellowgreen;
  }

  .disabled {
    background: #bbb;
    cursor: not-allowed;
    color: #999;
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
        on:click={()=>{if(isAllowed(day)){date=day}}}
        class:cell={true}
        class:highlight={isAllowed(day)}
        class:disabled={!isAllowed(day)}
        class:selected={+day==+date}
        class:notthismonth={day.getMonth()!=date.getMonth()}>
        {day.getDate()}
      </div>
    {/each}
  </div>
</div>
