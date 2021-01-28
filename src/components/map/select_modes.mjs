import _ from 'lodash'
/*
  Creates a variety of select modes we can chose from. 
  Returns the selection mutator.  
*/


const selectSingle = (id_accessor, e) => {
  const feature = e.detail.features[0]
  const id = id_accessor(feature)
  return (selected) =>  [id]
}

const selectXor = (id_accessor, e) => {
  const feature = e.detail.features[0]
  const id = id_accessor(feature)
  // we need a comparator which knows how to compared objects, so we use json stringify  
  return (selected) => _.xorBy(selected,[id], JSON.stringify) 
}

export const ctrl_click_adds = {
  name:"click for single, ctrl click to add / remove",
  instructions: "Click on the map for a new selection. Ctrl- or Cmd-click to add or remove from current selection.",
  selectMutator: (id_accessor, e) => {
    if (e.detail.event.originalEvent.ctrlKey || e.detail.event.originalEvent.metaKey) {
      return selectXor(id_accessor, e)
    } else {
      return selectSingle(id_accessor, e)
    }
  }
} 

export const single_only = {
  name:"single areas only",
  instructions: "Click on the map to select a new area.",
  selectMutator: selectSingle
}

export const xor_only = {
  name:"click to add / remove",
  instructions: "Click on the map to add or remove an area.",
  selectMutator: selectXor
} 

export const all_select_modes = [
  selectXor,
  ctrl_click_adds,
  single_only
]
