<script>
  import DatePicker from '$components/datepicker/DatePicker.svelte'
  import * as dfunc from 'date-fns'

  export let data 
  export let match
  export let isAllowed 
  export let field = "time"
  let startDate
  let endDate

  $: firstofStartmonth = dfunc.startOfMonth(startDate)
  $: lastofStartmonth = dfunc.endOfMonth(startDate)
  $: firstofEndmonth = dfunc.startOfMonth(endDate)
  $: lastofEndmonth = dfunc.endOfMonth(endDate)

  export let pipeline
   
  $: pipeline = [{
    $match: {
      $or: [
        {
          [field]:{
            $gte: firstofStartmonth,
            $lte: lastofStartmonth
          }
        },{
          [field]:{
            $gte: firstofEndmonth,
            $lte: lastofEndmonth
          }
        }
      ]
    }
  }]

  $: match = {
    [field]: {
      $gte: startDate,
      $lte: endDate
    }
  }

</script>

<DatePicker bind:selected = {startDate} isAllowed/>
<DatePicker bind:selected = {endDate} isAllowed/>
