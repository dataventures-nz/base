<script>
  import {deleteNode} from '$components/api.mjs'

  export let node
  export let nodes 
  export let getData
  let reason

  $: admins_all_parents = node.parents.every(parent => nodes.map(x => x._id).includes(parent))
  $: children_will_not_be_orphened = node.children.every(child => nodes.filter(n => n.id==child)[0].parents.length > 1)
  $: canItHappen = admins_all_parents && children_will_not_be_orphened

  $: if (!admins_all_parents) {
    reason = "you can't delete a node when you do NOT admin all of it's parents."
  } else if (!children_will_not_be_orphened) {
    reason = "you can't delete a node when you will orphan a child (you monster)."
  } else {
    reason = "you should be good to go"
  }

  const makeItHappen = async () => {
    const confirmed = confirm("Are you sure?")
    if (confirmed) {
      await deleteNode(node._id)
      getData()
    }
  }
</script>

<button disabled={!canItHappen} title={reason} on:click={makeItHappen}>Delete</button><br>
