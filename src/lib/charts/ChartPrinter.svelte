<script>
  export let svg
  export let filename = 'image'
  export let svgnocsstext = false
  export let pngtext = false
  export let svgtext = 'download svg'
  import picsaver from 'save-svg-as-png'

  const savesvg = () => picsaver.saveSvg(svg, filename + '.svg', { excludeUnusedCss: true })
  const savewithoutcss = () => picsaver.saveSvg(svg, filename + '.svg', { excludeCss: true })
  const savepng = () => picsaver.saveSvgAsPng(svg, filename + '.png')
</script>

{#if svgtext}
  <button on:click={savesvg}>{svgtext}</button>
{/if}
{#if svgnocsstext}
  <button on:click={savewithoutcss}>{svgnocsstext}</button>
{/if}
{#if pngtext}
  <button on:click={savepng}>{pngtext}</button>
{/if}
