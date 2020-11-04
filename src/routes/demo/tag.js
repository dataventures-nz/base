/*
Parent, Parent, Parent
  |    \   |   /
Child    Child

Node = [Collection | Tag | Person]

Nodes, list of parents, but in practice only Tags, and Person does.
Nodes, ALSO have a list of assignable, but in practice, only users so.
Nodes, restrictions .... {population:{hourly:{read:{region:1}}}} // the filter!

Person has a ID = "auth0|52434xfsa345fkfdjlkdsf"
Person has email
Person has nickname
Person has picture

Tags have names

Collection -> Tag -> Tag -> Tag -> Person

*/

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
  // TODO: are you even aloud to make a database you scrub?
  // normally there is a check to throw your toys out if it already exists.....
  let _collection = addToDb({type:"collection", db, collection}) // tables are not big things
  _addChild(_collection,asUser) // creators can see their creations
  _addAssignable(_collection,asUser) // creators can give others rights to see their creations
  return _collection
}

// You can only create a tag, for a node which you have assign rights to, and that becomes it's parent.
// You are automatically given assign rights for any tag you create.
const createTag = (name, parent, asUser) => {
  console.log("","creating tag", name, "from parent", parent, "asUser", asUser)
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
  // TODO can't remove last assigner - must make find all assignees.
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

const isAssignable = (user, node) => user.assignable.includes(node._id)
const isParent = (parent, child) => child.parents.includes(parent._id)
const setRestriction = (node, db, collection, permission, restriction, asUser) => {
  const nope1 = !matchFor(node,db,collection,permission)
  if (nope1) {
    throw "there is no path to collection from here, so, you can't edit rights for that path"
  }
  const nope2 = node.parents.map(parent => node_database[parent]).some(parent => !asUser.assignable.includes(parent._id) && matchFor(parent,db,collection,permission))
  if (nope2) {
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
  const collision = Object.keys(o1).some(k=> Object.keys(o2).includes(k)) // is any key in both objects
  if (collision) {
    return {$and:[o1,o2]} // can't merge
  } else {
    return {...o1, ...o2} // merged
  }
}

const matchFor = (node,db,collection,permission) => {
  let _permission = node?.restrictions?.[db]?.[collection]?.[permission]
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
const hourly = createCollection("population","hourly", blair)

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

console.log("amy, she admins for another org (azOrg), who tend to use stuff on a regional and time basis")
const amy = createUser("amy") // admin for another org

console.log("zach, he works for amy's org")
const zach = createUser("zach") // user for another org

console.log("wendy is from another org, getting stuff from Amy's org, she is only interested in wellington")
const wendy = createUser("wendy") // wendy wellington

console.log("arthur is from another org, getting stuff from Amy's org, she is only interested in auckland")
const arthur = createUser("arthur") // arthur auckland

console.log("criss is from another org, getting stuff from Amy's org, he is only interested in christchurch")
const criss = createUser("criss") // criss christchurch

console.log("cordy is a contractor, they work for different orgs, on and off, sometimes more than one")
const cordy = createUser("cordy") // cordy the contractor

console.log("lets start our story.... blair sets up stuff for amy to run")
console.log("they get hourly for this year")
const azOrg = createTag("azOrg", hourly, blair)

console.log("he sets a restriction on it")
setRestriction(azOrg, "population", "hourly", "read", {time_utc:{$gt:"2020-01-01T00:00:00"}}, blair)

console.log("they get monthly for the last 2 years- but blair shouldn't be able to since he isn't assigner to monthly.")
try {
  addChildToParent(azOrg,monthly,blair)
} catch (ex) {
  console.log("and he can't because ", ex)
}

console.log("Sarah steps in and fixes that by giving blair assigner to monthly")
assign(monthly,blair,sarah)

console.log("Blair then finishes setup")
addChildToParent(azOrg,monthly,blair)
setRestriction(azOrg, "population", "monthly", "read", {time_utc:{$gt:"2019-01-01T00:00:00"}}, blair)

console.log("Sarah points out it should be time_nzst, and goes to fix it")
setRestriction(azOrg, "population", "monthly", "read", {time_nzst:{$gt:"2019-01-01T00:00:00"}}, sarah)

console.log("Sarah tries to fix hourly, but, she doesn't have assigner access, so she shouldn't be able to edit that")
try {
  setRestriction(azOrg, "population", "hourly", "read", {time_nzst:{$gt:"2020-01-01T00:00:00"}}, sarah)
} catch (ex) {
  console.log("and she can't because ", ex)
}

console.log("Blair adds her to hourly as he should have a long time ago")
assign(hourly,sarah,blair)

console.log("Since she is already on the screen, and it is ready to go, she presses apply again.....")
setRestriction(azOrg, "population", "hourly", "read", {time_nzst:{$gt:"2020-01-01T00:00:00"}}, sarah)

console.log("blair hands over azOrg to amy")
assign(azOrg,amy,blair)

console.log("who gives zach acess")
addChildToParent(zach,azOrg,amy)

console.log("who run a query")

console.log("now zach can see both hourly", matchFor(zach,"population","hourly","read"))
console.log("and monthly", matchFor(zach,"population","monthly","read"))


console.log("wendy wellington and authur auckland come on board, forcing the creation of more tags, amy gets to work")
const wellington = createTag("Wellington", azOrg, amy)
const auckland = createTag("Auckland", azOrg, amy)
setRestriction(auckland, "population", "hourly", "read", {region:1}, amy)
setRestriction(auckland, "population", "monthly", "read", {region:1}, amy)
setRestriction(wellington, "population", "hourly", "read", {region:4}, amy)
setRestriction(wellington, "population", "monthly", "read", {region:4}, amy)

addChildToParent(arthur,auckland,amy)
addChildToParent(wendy,wellington,amy)

console.log("now arthur can see both hourly", matchFor(arthur,"population","hourly","read"))
console.log("and monthly", matchFor(arthur,"population","monthly","read"))

console.log("and wendy can see both hourly", matchFor(wendy,"population","hourly","read"))
console.log("and monthly", matchFor(wendy,"population","monthly","read"))

console.log("cordy comes on board, and amy sets to work giving her both wellington and auckland permissions")
addChildToParent(cordy,auckland,amy)
addChildToParent(cordy,wellington,amy)
console.log("and cordy can see both hourly", matchFor(cordy,"population","hourly","read"))
console.log("and monthly", matchFor(cordy,"population","monthly","read"))
