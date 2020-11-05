<script>
	import {onMount} from 'svelte'
	// import rome from '@bevacqua/rome'
	// import moment from 'moment'
 	export let placeholder;
	let element;
	export let datepicker;

	let datepickerOptions = {
		inputFormat: "DD MMMM YYYY",
		time: false,
			days: false,
		autoClose: false,
		autoHideOnBlur:false,
		invalidate:true
		// min: startDate,
		// max: endDate
	}

// onMount(async () => {
// 		const romeMod = await import('@bevacqua/rome')
// 		// const rome = romeMod.default
// 		datepicker = rome(element,datepickerOptions)
// })

</script>

<style type="text/scss">

	img{
		height:25px
	}

</style>

<div class="control has-icons-right">
  <input class="input" type="text" bind:this = {element} placeholder={placeholder} >
  <span class="icon is-right input-month-icon">
    <img src="../svg/month-icon.svg" alt="Month Icon">
  </span>
</div>
