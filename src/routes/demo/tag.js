const _addAssignable = (node, assigner) => assigner.assignable = [...new Set([...assigner.assignable, node._id])]
const _addChild = (parent, child) => child.parents = [...new Set([...child.parents, parent._id])]

const node_database = []
let currentRecord = 0
const addToDb = (record) => {
  record._id = currentRecord++
  record.parents = record.parents || [] // no parents? 
  record.assignable = record.assignable || [] // no assignable?
  record.restrictions = record.restrictions || {} // no restrictions
  node_database.push(record)
  return record
}

// Users are created by the auth engine, on first login.
// They are given no parents, so can't see anything.
const createUser = (name) => addToDb({type:"user", name})

// create collection
// You are automatically given assign rights, and default view for any collection you create.
const createCollection = (db,collection,asUser) => {
  // normally there is a check to throw your toys out if it already exists.....
  let _collection = addToDb({type:"collection", db, collection}) // tables are not big things
  _addChild(_collection,asUser) // creators can see their creations
  _addAssignable(_collection,asUser) // creators can give others rights to see their creations
  return _collection
}

// You can only create a tag, for a node which you have assign rights to, and that becomes it's parent.
// You are automatically given assign rights for any tag you create.
const createTag = (name, parent, asUser) => {
  console.log("","creating tag", asUser)
  if (!asUser.assignable.includes(parent._id)) {
    throw "you don't have assign rights to the node you are trying to add the tag to"
  }
  let tag = addToDb({type:"tag", name, parents:[parent._id]})
  _addAssignable(tag,asUser) // creators can give others rights to see their creations
  return tag
}

// You can give assign rights to a node, if you have assign rights for that tag yourself.
const assign = (node, assigner, asUser) => {
  console.log("\t", "assigning ", assigner, "to", node, "as", asUser)
  if (!asUser.assignable.includes(node._id)) {
    throw "you don't have assign rights to the node you are trying to add an assigner to"
  }
  _addAssignable(node,assigner) // creators can give others rights to see their creations
}

// You can remove assign rights for a tag, to a node, if you have assign rights for that tag yourself.
const removeAssignRight = (node, assigner, asUser) => {
  if (!asUser.assignable.includes(node._id)) {
    throw "you don't have assign rights to the node you are trying to remove an assigner from"
  }
  assigner.assignable = assigner.assignable.filter(x => x != node._id) // assigners can throw other assigners out, they can even throw themselves out.
}

// You can add a parent to a child, if you have assign rights for the parent.
const addChildToParent = (child, parent, asUser) => {
  if (!asUser.assignable.includes(parent._id)) {
    throw "you don't have assign rights to the node you are trying to remove an assigner from"
  }
  _addChild(parent,child)
}

// You can remove a parent from a child, if you have assign rights for the parent.
const removeChildFromParent = (child, parent, asUser) => {
  if (!asUser.assignable.includes(parent._id)) {
    throw "you don't have assign rights to the node you are trying to remove from"
  }
  child.parents = child.parents.filter(x => x != node._id) // assigners can throw other assigners out, they can even throw themselves out.
}

const setRestriction = (node, db, collection, permission, restriction, asUser) => {
  // we need to be assignable for ALL parents for that db, and collection
  // is there ANY parents of the node, which has a path to the db/collection, which does we are NOT assignable.
  const nope = node.parents.some(parent => !asUser.assignable.includes(parent._id) && matchFor(node,db,collection,permission))
  if (nope) {
    throw 'you do not have sufficiant permissions to change this, you must have assigner rights to all parents, go make a child from here'
  } // weirdly enough, it is ok for you not to have assigner rights to THIS node.
  node.restrictions[db] = node.restrictions[db] || {}
  node.restrictions[db][collection] = node.restrictions[db][collection] || {}
  node.restrictions[db][collection][permission] = restriction
}

// assigns an account to have a user as it's only parent.
const become = (testAccount, user) => {
  // TODO: check if it is ok.
  testAccount.parents = [user._id]
  return testAccount
}

/*
  if you have 2 match objects for mongodb, and you need to convert them into one object....
  either you can merge them, or you have to $and them

  a = {name:"blair", age:{$gt:40}} // all blairs above 40
  b = {pet:"cat"} // all people who have a cat
  
  then we can merge them into 
  {name:"blair", age:{$gt:40}, pet:"cat"} // all blairs above 40, who have a cat

  but....

  a = {name:"blair", age:{$gt:40}} // all blairs above 40
  b = {age:{$gt:10, $lt:45}} // all people between 10 and 45
  
  because we are NOT going to even try to work out how to merge the 2, even though you could....  
  {$and:[
    {name:"blair", age:{$gt:40}},
    {age:{$gt:10, $lt:45}}
  ]}
  is reasonable, after all, this is ONLY so the end query is easy to understand. 
  MongoDB doesn't care which one it is, this is for users.
*/
const handleKeyCollision = (o1,o2) => {
  const collision = o1.keys().some(k=> o2.keys().includes(k)) // is any key in both objects
  if (collision) {
    return {$and:[o1,o2]} // can't merge
  } else {
    return {...o1, ...o2} // merged
  }
}

const matchFor = (node,db,collection,permission) => {
  console.log("\t", "matchFor", node, db, collection, permission)
  let _permission = node?.restrictions?.collection?.[permission]
  // lets deal with the case where this is the wrong collection.
  if (node.type=='collection'){
    if (node.db != db || node.collection != collection) return undefined // no path to collection, no data from this path.
    return _permission || {} // get the permission (everything if not defined) TODO: check that.
  }
  // so, now we are not a collection, and therefore expected to have parents....
  const matches = node.parents.map(parent => matchFor(node_database[parent],db,collection,permission)).filter(x => !!x)
  if (matches.length == 0) return undefined // there is no path to collection, bail out now

  const parentMatches = matches.length == 1?matches[0]:{ $or:matches }
  if (_permission == undefined) {
    return parentMatches // passthough.
  }
  return handleKeyCollision(parentMatches, _permission??{}) // merge if we can
}

console.log("ACT I - Taylor wants to get shit done")
console.log("let us welcome our cast")
console.log()

console.log("creating user blair, he is the hourly admin")
const blair = createUser("blair") // person who looks after hourly

console.log("creating user sarah, she is the monthly admin")
const sarah = createUser("sarah") // person who looks after monthly

console.log("creating user jamie, he is given all of the powers (eventually)")
const jamie = createUser("jamie") // person who also admins stuff

console.log("creating user taylor, he works for dv")
const taylor = createUser("taylor") // person who actually does real work

console.log()
console.log("and the play begins")
console.log()

console.log("blair creates a table, population/hourly")
const hourly = createCollection("population","hourly",blair)

console.log("sarah creates a table, population/monthly")
const monthly = createCollection("population","monthly",sarah)

console.log("blair, being a table creator, can see his own table by default")
console.log("his match looks like", matchFor(blair,"population","hourly","read"))

console.log("blair, can't see his sarahs table by default")
console.log("his match looks like", matchFor(blair,"population","monthly","read"))

console.log("sarah assigns jamie rights to monthly")
assign(monthly,jamie,sarah)

console.log("realizing blair forgot to do so sarah tries to assign jamie rights to hourly, she shouldn't be able to")
try {
  assign(hourly,jamie,sarah)
} catch (ex) {
  console.log("and sarah can't because ", ex)
}

console.log("she tells blair to do so, and he does")
assign(hourly,jamie,blair)

console.log("so, taylor needs to use the datasets, and blair, sarah, and jamie would like to see them too so we create a DataVentures tag")
console.log("blair does so")
const dataventures = createTag("data ventures", hourly, blair)

console.log("being on form, blair actually remembers to give assign rights")
assign(dataventures,jamie,blair)
assign(dataventures,sarah,blair)

console.log("he even adds everyone to the group (the dried frog pills are working!)")
addChildToParent(taylor,dataventures,blair)
addChildToParent(sarah,dataventures,blair)
addChildToParent(jamie,dataventures,blair)
addChildToParent(blair,dataventures,blair)

console.log("taylor can see hourly", matchFor(taylor,"population","hourly","read"))
console.log("but not monthly", matchFor(taylor,"population","monthly","read"))

console.log("with sarah being on holiday, taylor tries to fix it")
try {
  addChildToParent(dataventures,monthly,taylor)
} catch (ex) {
  console.log("and he can't because ", ex)
}

console.log("jamie can though")
addChildToParent(dataventures,monthly,jamie)

console.log("now taylor can see both hourly", matchFor(taylor,"population","hourly","read"))
console.log("and monthly", matchFor(taylor,"population","monthly","read"))

console.log("everyone is happy - they go out for beer")
console.log()
console.log("ACT II - Whats this? A customer?")
console.log("let us welcome our new cast members")
console.log()

console.log("creating user amy, she admins for another org")
const amy = createUser("amy") // admin for another org

console.log("creating user zach, he works for amy's org")
const zach = createUser("zach") // user for another org

