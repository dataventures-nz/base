import { writable } from 'svelte/store';

export const createDebounceStore = (initialValue, fn) => {
  const { subscribe, set } = writable(initialValue)
  const errorStore = writable(undefined)
  const currentlyProcessing = writable(true)
  let processing = true
  let nextValue = undefined
  let currentValue = undefined
  let kick = false

  const setProcessing = (x) => {processing = x; currentlyProcessing.set(x)} 

  const complete = (result) => {
    set(result)
    setProcessing(false)
    checkQueue()
  }

  const handleError = (reason) => {
    errorStore.set(reason)
    setProcessing(false)
    checkQueue()
  }

  const startProcessing = () => {
    currentValue = nextValue
    kick = false
    setProcessing(true)
    fn(currentValue).then(complete).catch(handleError)
  }

  const checkQueue = () => {
    if (processing) {
      return
    }
    if (kick || (JSON.stringify(currentValue) != JSON.stringify(nextValue))){
      startProcessing()
    }
  }

  return {
    currentlyProcessing,
    kick: () => {kick = true; checkQueue()},
    start: () => {setProcessing(false); checkQueue()},
    queue: (value) => { nextValue = value; checkQueue() },
    error: {subscribe: errorStore.subscribe},
    clearError: () => errorStore.set(undefined),
    subscribe
  }
}
