<script>
  import * as d3 from 'd3'
  import picsaver from 'save-svg-as-png'
  export let groups

  export let height = 800
  export let width = 1600
  export let position = [0.3, 0.2]
  export let plotwidth = 0.2
  export let xdomain = [0, 1]
  export let ydomain = [0, 1]
  export let yextent = [0, 1]
  export let yaccessor = d => +d.y
  export let xaccessor = d => d.offset
  export let stroke = (d, i) => 'black'
  export let fill = (d, i) => 'black'
  export let background = '#ffffff'
  export let fillOpacity = (d, i) => 1
  export let brokenaxis = 0
  export let filename = 'filename'
  export let filled = false
  export let closed = false
  export let hasbackground = false
  export let dx
  export let dy
  export let usemouse = true
  export let chunkPostProcess = d => d
  export let curve = d3.curveLinear
  export let overline = false

  let options
  $: options = { height, width, xdomain, ydomain, yextent, yaccessor, xaccessor }
  $: console.log({ groups })
  let yscale = d3.scaleLinear()
  let xscale = d3.scaleLinear()

  const area = d3
    .area()
    .curve(curve)
    .x(d => xscale(options.xaccessor(d)))
    .y0(d => yscale(options.yaccessor(d)))
    .y1(d => yscale(0))

  const line = d3
    .line()
    .curve(curve)
    .x(d => xscale(options.xaccessor(d)))
    .y(d => yscale(options.yaccessor(d)))

  $: base_y_scale = d3
    .scaleLinear()
    .domain(d3.extent(lines.map(line => line[0].top)))
    .range([1, 0])

  const split = lines => {
    const splitLines = lines.flatMap(line => {
      let lastLeft = line[0].left

      const chunks = []
      let currentChunk = []
      line.forEach(pt => {
        if (pt.left - 15000 > lastLeft) {
          chunks.push(currentChunk)
          currentChunk = [pt]
        } else {
          currentChunk.push(pt)
        }
        lastLeft = pt.left
      })
      chunks.push(currentChunk)
      return chunks
    })
    splitLines.forEach(chunkPostProcess)
    return splitLines
  }

  let lines
  $: lines = split(Object.values(groups).map(d => d.data))

  let mousedown = false
  let mousep = {
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
    dx: function () {
      return this.x2 - this.x1
    },
    dy: function () {
      return this.y2 - this.y1
    }
  }

  const dragstart = e => {
    mousedown = true
    mousep.x1 = e.clientX
    mousep.x2 = e.clientX
    mousep.y1 = e.clientY
    mousep.y2 = e.clientY
  }

  const drag = e => {
    if (mousedown) {
      mousep.x2 = e.clientX
      mousep.y2 = e.clientY
    }
  }

  const dragend = () => {
    mousedown = false
  }

  let y1

  let svg, svgbackgroundstyle

  $: {
    yscale.domain(options.ydomain).range([options.height * position[0], 0])
    area.y0(d => yscale(options.yaccessor(d))).y1(() => yscale(brokenaxis * options.ydomain[1]))
    line.y(d => yscale(options.yaccessor(d)))
  }
  $: {
    xscale.domain(options.xdomain).range([0, width * plotwidth])
    area.x(d => xscale(options.xaccessor(d)))
    line.x(d => xscale(options.xaccessor(d)))
  }

  $: if (usemouse) {
    dx = mousep.dx()
    dy = mousep.dy()
  }
  $: y1 = yscale(options.yextent[1] - options.yextent[0])
  $: svgbackgroundstyle = hasbackground ? 'background-color:' + background : 'background-color:none'

  $: console.log({ xscale, yscale })
  $: console.log(options)

  const savesvg = () => picsaver.saveSvg(svg, filename + '.svg', { excludeUnusedCss: true })
  const savewithoutcss = () => picsaver.saveSvg(svg, filename + '.svg', { excludeCss: true })
  const savepng = () => picsaver.saveSvgAsPng(svg, filename + '.png')

  // hand over a data structure consisting of an object where each entry is an array
</script>

<svg
  height={options.height}
  width={options.width}
  style={svgbackgroundstyle}
  bind:this={svg}
  on:mousedown={dragstart}
  on:mousemove={drag}
  on:mouseup={dragend}
>
  <rect height={options.height} width={options.width} fill="none" />
  {#key { plotwidth, position, brokenaxis }}
    {#each lines as d, i}
      <g
        transform="translate({options.width * position[1] + dx * base_y_scale(d[0].top)},{y1 +
          dy * base_y_scale(d[0].top)})"
      >
        {#if !closed}
          <path fill="none" stroke={stroke(d, i)} d={line(d)} />
        {:else}
          <path
            fill={filled ? fill(d, i) : 'none'}
            fill-opacity={fillOpacity(d, i)}
            stroke={overline ? 'none' : stroke(d, i)}
            d={area(d)}
          />
          {#if overline}
            <path fill="none" stroke={stroke(d, i)} d={line(d)} />
          {/if}
        {/if}
      </g>
    {/each}
  {/key}
</svg>

<button on:click={savesvg}>gimme</button>
<button on:click={savewithoutcss}>no css</button>
<button on:click={savepng}>png</button>

<style>
  svg {
    /* background-color: azure; */
  }
  rect {
    stroke: black;
  }
</style>
