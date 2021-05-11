<script>
  import { deleteNode } from '$lib/api.js'

  export let node
  export let nodes
  export let getData
  let reason

  $: admins_all_parents = node.parents.every(parent => nodes.map(x => x._id).includes(parent))
  $: children_will_not_be_orphened =
    !node.children || node.children.every(child => nodes.filter(n => n.id == child)[0].parents.length > 1)
  $: canItHappen = admins_all_parents && children_will_not_be_orphened

  const canDelete = () => {
    if (!node.parents.every(parent => nodes.map(x => x._id).includes(parent))) {
      return "you can't delete a node when you do NOT admin all of it's parents."
    } else if (node?.children?.length) {
      return "you can't delete a node when it has children."
    } else {
      return undefined
    }
  }

  const makeItHappen = async () => {
    const confirmed = confirm('Are you sure?')
    if (confirmed) {
      await deleteNode(node._id)
      getData()
    }
  }
</script>

<button disabled={!canDelete} title={reason} on:click={makeItHappen}>Delete</button><br />
