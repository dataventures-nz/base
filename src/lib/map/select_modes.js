import _ from 'lodash'
/*
  Creates a variety of select modes we can chose from. 
  Returns the selection mutator.  
*/

const selectSingle = (id_accessor, e) => {
  const feature = e.detail.features[0]
  const id = id_accessor(feature)
  return selected => [id]
}

const selectXor = (id_accessor, e) => {
  const feature = e.detail.features[0]
  const id = id_accessor(feature)
  // we need a comparator which knows how to compared objects, so we use json stringify
  return selected => _.xorBy(selected, [id], JSON.stringify)
}

const selectN = n => {
  let i = 0
  return (id_accessor, e) => {
    const feature = e.detail.features[0]
    const id = id_accessor(feature)
    return selected => {
      if (selected.findIndex(d => d && d.id == id.id) > -1) {
        i = selected.findIndex(d => d.id == id.id)
        selected[i] = undefined
        return selected
      }
      selected[i] = id
      i = (i + 1) % n
      return selected
    }
  }
}

export const ctrl_click_adds = {
  name: 'click for single, ctrl click to add / remove',
  instructions: 'Click on the map for a new selection. Ctrl- or Cmd-click to add or remove from current selection.',
  selectMutator: (id_accessor, e) => {
    if (e.detail.event.originalEvent.ctrlKey || e.detail.event.originalEvent.metaKey) {
      return selectXor(id_accessor, e)
    } else {
      return selectSingle(id_accessor, e)
    }
  }
}

export const single_only = {
  name: 'single areas only',
  instructions: 'Click on the map to select a new area.',
  selectMutator: selectSingle
}

export const xor_only = {
  name: 'click to add / remove',
  instructions: 'Click on the map to add or remove an area.',
  selectMutator: selectXor
}

export const select_2 = {
  name: 'select up to two areas',
  instructions: 'Click on the map to add or remove an area.',
  selectMutator: selectN(2)
}

export const all_select_modes = [selectXor, ctrl_click_adds, single_only]
