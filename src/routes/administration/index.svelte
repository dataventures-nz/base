<script>
  import { admin_url, fetch_json, setRestriction, delAdmin, deleteNode, delLink } from '$lib/api.js'
  import AddCollectionForm from './_forms/AddCollectionForm.svelte'
  import AddMaterialisedViewForm from './_forms/AddMaterialisedViewForm.svelte'
  import AddTagForm from './_forms/AddTagForm.svelte'
  import AddAdminForm from './_forms/AddAdminForm.svelte'
  import DeleteButton from './_forms/DeleteButton.svelte'
  import NodeList from './NodeList.svelte'
  import Node from './Node.svelte'
  import Schema from './Schema.svelte'
  import Modal from './_forms/Modal.svelte'

  import {
    ExpansionPanels,
    ExpansionPanel,
    Row,
    Col,
    Button,
    Card,
    CardText,
    CardTitle,
    CardActions,
    CardSubtitle,
    TextField,
    Icon,
    Avatar,
    MaterialApp
  } from 'svelte-materialify'
  import { mdiMagnify, mdiDatabase, mdiTag, mdiDelete } from '@mdi/js'

  let showAddCollection = false
  let showAddMaterialisedView = false
  let showAddTag = false
  let showAddAdmin = false

  const setNode = e => (node_id = e.detail._id)

  const isValidPermission = permission => {
    try {
      JSON.parse(permission.read)
      return true
    } catch {
      return false
    }
  }

  const sortByName = (a, b) => a._id.localeCompare(b._id)

  let nodes = []
  const getData = () =>
    fetch_json('GET', admin_url(''))
      .then(x =>
        x.sort(sortByName).map(x => {
          x.id = x._id
          return x
        })
      )
      .then(x => (nodes = x))
  getData()

  const update = () => {
    getData()
    node = nodes.filter(n => (n.id = node.id))[0]
  }

  let me = undefined
  const getMe = () => fetch_json('GET', admin_url('/whoAmI')).then(x => (me = x))
  getMe()

  let all_permissions = []
  const getAllPermissionsFor = n =>
    fetch_json('POST', admin_url('/canEditPermissions'), { node: n, permission: 'read' }).then(
      x => (all_permissions = x)
    )
  const setPermission = permission => {
    setRestriction(permission.db, permission.collection, node_id, 'read', JSON.parse(permission.read))
  }

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
  $: title = node ? 'Admin - ' + node.type + ':' + node._id : 'Admin'

  const getAll = ids => nodes.filter(node => ids?.includes(node._id))
  const getAdminsOf = id => nodes.filter(user => user.type == 'user' && user?.admins?.includes(id))

  const canDeleteMe = (node) => {
    let reason = undefined
    if (!node.parents.every(parent => nodes.map(x => x._id).includes(parent))) {
      reason = "you can't delete a node when you do NOT admin all of it's parents."
    } else if (node?.children?.length) {
      reason = "you can't delete a node when it has children."
    } 
    console.log(reason)
    return reason
  }

  const deleteMe = async () => {
    const confirmed = confirm('Are you sure?')
    if (confirmed) {
      await deleteNode(node._id)
      getData()
    }
  }


  
</script>

<svelte:head><title>{title}</title></svelte:head>

<Row>
  <Col cols={12} md={2}>
    <TextField class="ma-1" outlined dense clearable bind:value={filter}>
      <div slot="prepend">
        <Icon path={mdiMagnify} />
      </div>
      Search
    </TextField>
    <Card outlined class="ma-1">
      <CardText>
        Collections
        <NodeList items={filtered_collections} on:selectItem={setNode} />
      </CardText>
      {#if me?.canAddCollectionTo}
        <CardActions>
          <Button style="width:100%" on:click={() => (showAddCollection = true)}>Add New Collection</Button>
        </CardActions>
      {/if}
      <CardText>
        Tags
        <NodeList items={filtered_tags} on:selectItem={setNode} />
      </CardText>
      <CardText>
        Users
        <NodeList items={filtered_users} on:selectItem={setNode} />
      </CardText>
    </Card>
  </Col>
  <Col cols={12} md={10}>
    <Card outlined class="ma-1">
      {#if node}
        <CardTitle class="justify-center">
          <div style="display:inline-block; transform: scale(2.0); align: center" >
            <Node item={node} del={!canDeleteMe(node)} on:delete={deleteMe}/>
          </div>
        </CardTitle>

        <CardText>

          {#if parents.length>0}
            <CardTitle>Parents</CardTitle>
            <NodeList items={parents} on:selectItem={setNode} />
          {/if}
          {#if node.type != 'user'}
            <CardTitle>Children</CardTitle>
            <NodeList del items={children} on:selectItem={setNode} on:delete={async e => {
              console.log("deleting link between", node_id, e.detail)
              await delLink(node_id, e.detail.item._id)
              update()
            }}/>
            <Button on:click={() => (showAddMaterialisedView = true)}>Add Materialised View</Button>
            <Button on:click={() => (showAddTag = true)}>Add Tag</Button><br>
          {/if}
          <CardTitle>Admined By</CardTitle>
            <NodeList del items={adminedBy} on:selectItem={setNode} on:delete={async e => {
              console.log("deleting!!", node_id, e.detail)
              await delAdmin(node_id, e.detail.item._id)
              update()
            }} />

            <Button on:click={() => (showAddAdmin = true)}>Add Admin</Button><br>
          {#if node.type == 'user'}
            <CardTitle>Admins</CardTitle>
            <NodeList del items={admins} on:selectItem={setNode}
         />
          {/if}


          <CardTitle>Permissions</CardTitle>

          <ExpansionPanels multiple>
            {#if node.type == 'collection'}
            <ExpansionPanel>
              <span slot="header">Schema</span>
              <Schema schema={JSON.stringify(node.schema, null, 2)} {node_id} on:saved={update} />
            </ExpansionPanel>
            {/if}
                
            {#each all_permissions as permission}
            <ExpansionPanel>
              <span slot="header">{permission.db} - {permission.collection}</span>
              <textarea rows="4" cols="50" disabled={!permission.can_edit} bind:value={permission.read} />
              <button disabled={!isValidPermission(permission)} on:click={() => setPermission(permission)}>Apply</button>
            </ExpansionPanel>
            {/each}
            </ExpansionPanels>
        </CardText>
      {/if}
    </Card>
  </Col>
</Row>

<AddCollectionForm bind:active={showAddCollection} admin={me} close={update}/>
<AddTagForm bind:active={showAddTag} {nodes} close={update} parent={node_id} />

{#if showAddMaterialisedView}
  <Modal
    on:close={() => {
      showAddMaterialisedView = false
      getData()
    }}
    let:close
  >
    <AddMaterialisedViewForm admin={me} {close} />
  </Modal>
{/if}

<AddAdminForm bind:active={showAddAdmin} {nodes} close={update} parent={node_id} />
