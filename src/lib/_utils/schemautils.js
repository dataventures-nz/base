export function mappable_fields(collection) {
  let properties
  if (collection.schema) {
    properties = collection.schema?.properties ?? {}
  } else {
    properties = collection?.properties ?? {}
  }
  let maplayers = []
  Object.entries(properties).map(d => {
    if (d[1].map) {
      d[1].map.selection = []
      maplayers.push({
        db: { field: d[0] },
        map: d[1].map,
        ui: { visible: false, include: true }
      })
    }
  })
  return maplayers
}

export function time_fields(collection) {
  let properties
  if (collection.schema) {
    properties = collection.schema?.properties ?? {}
  } else {
    properties = collection?.properties ?? {}
  }
  let timefields = []
  Object.entries(properties).map(d => {
    if (d[1].bsonType == 'date') {
      timefields.push(d[0])
    }
  })
  return timefields
}
