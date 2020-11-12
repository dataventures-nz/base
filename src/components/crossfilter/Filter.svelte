<script>
  import { getContext } from "svelte";
  export let pipeline = []
  export let brush = {}
  export let data = []
  export let currently_fetching = false
  export let other_brushes = []
  export let id = ""
  let brushStore = getContext("brushStore")
  let last_pipeline = null
  let last_other_brushes = null

  let {db,collection} = getContext("config")

  const do_fetch = () => {
    const other_matches = other_brushes.map(b => ({$match:b}))
    const q = [...other_matches, ...pipeline]
    console.log(`query(${db}, ${collection}, ${JSON.stringify(q)})`)
    console.log("I am quite fetching for ", {id, db, collection, other_brushes, pipeline})
  }

  const start_fetching = async () => {
    last_pipeline = pipeline
    last_other_brushes = other_brushes
    data = await do_fetch()
    currently_fetching = false
    queueFetch()
  }

  const queueFetch = () => {
    const pipeline_unchanged = JSON.stringify(last_pipeline) == JSON.stringify(pipeline)
    const other_brushes_unchanged = JSON.stringify(last_other_brushes) == JSON.stringify(other_brushes)
    if (currently_fetching || (other_brushes_unchanged && pipeline_unchanged)) {
      return 
    }
    currently_fetching = true
    start_fetching()
  }

  $: if (pipeline && other_brushes){ queueFetch() } // run on changed

  brushStore.subscribe(store => {
    const other_components = Object.keys(store).filter(k => k != id)
    other_brushes = other_components.map(k=> store[k])
	});

  $: console.log("hi my name is ", id," and my brush is ", brush)
  $: brushStore.update(store => ({...store, [id]:brush}) )

</script>