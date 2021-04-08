<script>
	import * as d3 from 'd3';
	import { getContext } from 'svelte';
	export let x = 0;
	export let y = 0;
	export let data = [
		{ x: 0, y1: 0.3, y2: 0.7 },
		{ x: 1, y1: 0.7, y2: 0.3 }
	];
	export let xaccessor = (d) => d.x;
	export let layers = [
		{
			name: 'y1',
			accessor: (d) => d.y1,
			style: { fill: 'pink', stroke: 'black', 'fill-opacity': 0.5 }
		},
		{
			name: 'y2',
			accessor: (d) => d.y2,
			style: { fill: 'pink', stroke: 'black', 'fill-opacity': 0.5 }
		}
	];
	let { height, width, margin, xScale, yScale, xextent, yextent } = getContext('constants');
</script>

<g>
	<line x1={x} x2={x} y1={0} y2={height - 2 * margin} />
</g>

<style type="text/scss">
	line {
		stroke: black;
	}
</style>
