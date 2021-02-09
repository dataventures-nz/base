<script>
  import {admin_url, fetch_json} from '$components/api.mjs'
  import NodeList from './NodeList.svelte'
  import Schema from './Schema.svelte'

  const sortByName = (a,b) => a._id.localeCompare(b._id)

  let nodes = []
  const getData = () => fetch_json("GET", admin_url("")).then(x => x.sort(sortByName).map(x => {x.id = x._id; return x})).then(x => nodes = x)
  getData()

  const update = () => {getData(); node = (nodes.filter(n => n.id = node.id))[0]}

  let me = undefined
  const getMe = () => fetch_json("GET", admin_url("/whoAmI")).then(x => me = x)
  getMe()

  let all_permissions = []
  const getAllPermissionsFor = (n) => fetch_json("POST", admin_url("/canEditPermissions"), {node:n,permission:'read'}).then(x => all_permissions = x)
  
/*
  Org nodes are ones where the people running it, could get data from other people, who are not you.
  You can't put restrictions on them, so, you should make a node BEFORE them, if you want to restrict them
  The reason, you can't is, because the moment a second parent is added, you won't be able to edit it anyway, so, lets not paint 
  you into a corner eh?  
*/

  let filter = ''
  
  $: filtered_collections = nodes.filter(x => x.type == 'collection' && x._id.includes(filter))
  $: filtered_tags = nodes.filter(x => x.type == 'tag' && x._id.includes(filter))
  $: filtered_users = nodes.filter(x => x.type == 'user' && x._id.includes(filter))

  let node_id = undefined
  $: node = nodes.filter(node => node_id == node?._id)?.[0]

  $: node && !node.org && getAllPermissionsFor(node._id)
  $: parents = node ? getAll(node.parents) : []
  $: children = node ? getAll(node.children) : []
  $: admins = node ? getAll(node.admins) : []
  $: adminedBy = node ? getAdminsOf(node._id) : []
  $: title = node? ("Admin - " + node.type + ":" + node._id) : "Admin"
  
  const getAll = (ids) => nodes.filter(node => ids?.includes(node._id))
  const getAdminsOf = (id) => nodes.filter(user => user.type == 'user' && user?.admins?.includes(id))
</script>

<svelte:head><title>{title}</title></svelte:head>

<div class='row'>
  <div class="col-xs-2">
    <input bind:value={filter}>

    <h3>Collections</h3>
    <NodeList source={true} target={false} items={filtered_collections} on:selectItem={e => node = e.detail}/>
    <button>Add New Collection</button>  

    <h3>Tags</h3>
    <NodeList source={true} target={false} items={filtered_tags} on:selectItem={e => node = e.detail}/>

    <h3>Users</h3>
    <NodeList source={true} target={false} items={filtered_users} on:selectItem={e => node = e.detail}/>
  </div>

  <div class="col-xs-10">
    {#if node}
      <h2><span class='{node.type} pill'>{node._id}</span></h2>

      <h3>Parents</h3>
      <NodeList source={false} items={parents} on:selectItem={e => node = e.detail}/>

      {#if node.type != 'user'}
      <h3>Children</h3>
      <NodeList source={false} items={children} on:selectItem={e => node = e.detail}/>
      <button>Add Materialised View</button>
      <button>Add Tag</button>
      <button>Add User</button>
      {/if}

      <h3>Admined By</h3>
      <NodeList source={false} items={adminedBy} on:selectItem={e => node = e.detail}/>
      <button>Add Admin</button>

      {#if node.type == 'user'}
        <h3>Admins</h3>
        <NodeList source={false} items={admins} on:selectItem={e => node = e.detail}/>
      {/if}

      {#if node.type == 'collection'}
      <h3>Schema</h3>
      <Schema schema={JSON.stringify(node.schema,null,2)} node_id={node._id} on:saved={update}/>
      {/if}


      <h3>Permissions</h3>
      {#if node.org}
        Orgs nodes don't have permissions.
      {:else}
        {#each all_permissions as permission} 
          <h4>{permission.db} - {permission.collection}</h4>
          <textarea id="w3review" rows="4" cols="50" disabled={!permission.can_edit}>{node?.restrictions?.[permission.db]?.[permission.collection]?.read || ''}</textarea>          
        {/each}
      {/if}
    {/if}
  </div>
</div>


