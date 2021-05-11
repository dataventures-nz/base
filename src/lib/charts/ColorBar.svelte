<script>
  import * as d3 from 'd3'
  /**
   * @type {function(any):string}
   */
  export let colorScale = d3.scaleLinear(["salmon","lime"])
  export let vertical = false
  export let margin={top:20,bottom:20,left:10,right:10}
  export let scaleSpace = 30
  export let length = 500
  export let width = 30
  
  let axisgroup
  let scale = d3.scaleLinear()

  $: totalWidth = width + (vertical ? margin.left+margin.right : margin.top+margin.bottom) + scaleSpace
  $: totalLength = length + (vertical ? margin.top+margin.bottom : margin.left+margin.right)

  let axis = vertical ? d3.axisRight() : d3.axisBottom()
  
  $: {
    scale = scale.domain(colorScale.domain()).range(vertical?[length,0]:[0,length])
    axis = axis.scale(scale)
    d3.select(axisgroup).call(axis)
    scaleSpace = axisgroup?.getBoundingClientRect()[vertical?'width':'height'] || 0
  }

  $: swatches = new Array(100)
    .fill(1)
    .map((d,i)=>{ 
      let swatchHeight = width
      let swatchWidth = length/100
      let fill = colorScale(scale.invert(length*(i+.5)/100))
      let x = margin.left+(i*swatchWidth)
      let y = margin.top
      if (vertical){
        swatchHeight = length/100
        swatchWidth = width
        x = margin.left
        y = (i*swatchHeight)+margin.top
      }
      let transform = `translate(${x},${y})`
      return {width:swatchWidth,height:swatchHeight,fill,transform}
    })


</script>

<svg 
  height={vertical?totalLength:totalWidth}
  width ={vertical?totalWidth:totalLength}
  >
  {#each swatches as swatch}
    <rect {...swatch} ></rect>
  {/each}
  {#if vertical}
    <g bind:this={ axisgroup }
    transform={ `translate(${margin.left+width},${margin.top})`}
    ></g>
  {:else}
    <g bind:this={ axisgroup }
    transform={ `translate(${margin.left},${margin.top+width})`}
    ></g>
  {/if}

</svg>

