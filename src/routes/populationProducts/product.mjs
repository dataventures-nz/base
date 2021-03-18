import { xor_only, select_2 } from '$components/map/select_modes.mjs'
import { query,extents } from '$components/api.mjs'
import * as df from "date-fns"

function inSelection(selection,dbfield) {
  let newmatch = {}
  if (dbfield && selection && selection.length){
    const idlist = selection.map(d=>+d.area_id)
    newmatch[dbfield] = {$in:idlist}
  }
  return newmatch
}

function inInterval(selection,dbfield,starttime,endtime){
return {
  time:{
    $gte:starttime,
    $lte:endtime
    }
  }
}

function population_between_pre(chartIndex){
  function filter(dbfield,selection){
    if(selection[chartIndex]){return[{"$match":{[dbfield]:+selection[chartIndex].area_id}}]}
    return [{[dbfield]:0}] // need to return a filter that wont return anything. check with Blair see if there ia a better way
  }
  return filter
}

function population_before_pre(chartIndex){
  function filter(dbfield,selection,s1,s2,period,weekdayOffset,alignWeekdays){
    if (chartIndex==0){
      return [{
        $match:{
          time:{
            $gte:s1,
            $lte:df.addDays(s1,period)
          }
        }
      }]
    } else if (chartIndex==1){
      return [
        {
          $match:{
            time:{
              $gte:df.addDays(s2,(alignWeekdays? +1*weekdayOffset:0)),
              $lte:df.addDays(s2,period+(alignWeekdays? +1*weekdayOffset:0))
            }
          }
        }]
    }
    return [{"time":null}]
  }
  return filter
}

function beforeToBetween(startDate,endDate){

}

function betweenToBefore(startDate,endDate){

  console.log("betweenToBefore")
  //preserves startDate and interval when moving to a one-year long timeframe
  let days = df.differenceInDays(endDate,startDate)
  if (days <= 1){days = 1}
  if (days > 365-df.getDayOfYear(startDate)){days = 365-df.getDayOfYear(startDate)}  

  startDate.setFullYear(2020)
  let ed = df.addDays(startDate,days)
  endDate.setFullYear(2020)
  endDate.setMonth(ed.getMonth())
  endDate.setDate(ed.getDate())

}


export const population_before = {
  population_before:true,
  selectMode:xor_only,
  commonFilter:inSelection, //commonfilter is mongo pipline applied to both charts
  uniqueFilter : population_before_pre,
  dateSliderFormat : d=> df.format(d,"MMM"),
  datePickerFormat : "d MMMM",
  dateExtents : (extents) => [new Date(2020,0,1), new Date(2020,11,31)],
  switch:beforeToBetween
}


export const population_between = {
  population_between:true,
  selectMode:select_2,
  commonFilter:inInterval,
  uniqueFilter:population_between_pre,
  dateSliderFormat : d=> df.format(d,"MMM yy"),
  datePickerFormat : "d MMMM yyyy",
  dateExtents: extents => extents.map(d=>new Date(d.substr(0,16))),
  switch:betweenToBefore
}

