<script>
	import { admin_url, fetch_json, setRestriction } from '$lib/api.js';
	import AddCollectionForm from './forms/AddCollectionForm.svelte';
	import AddMaterialisedViewForm from './forms/AddMaterialisedViewForm.svelte';
	import AddTagForm from './forms/AddTagForm.svelte';
	import AddAdminForm from './forms/AddAdminForm.svelte';
	import DeleteButton from './forms/DeleteButton.svelte';
	import NodeList from './NodeList.svelte';
	import Schema from './Schema.svelte';
	import Modal from './forms/Modal.svelte';

	let showAddCollection = false;
	let showAddMaterialisedView = false;
	let showAddTag = false;
	let showAddAdmin = false;

	const setNode = (e) => (node_id = e.detail._id);

	const isValidPermission = (permission) => {
		try {
			JSON.parse(permission.read);
			return true;
		} catch {
			return false;
		}
	};

	const sortByName = (a, b) => a._id.localeCompare(b._id);

	let nodes = [];
	const getData = () =>
		fetch_json('GET', admin_url(''))
			.then((x) =>
				x.sort(sortByName).map((x) => {
					x.id = x._id;
					return x;
				})
			)
			.then((x) => (nodes = x));
	getData();

	const update = () => {
		getData();
		node = nodes.filter((n) => (n.id = node.id))[0];
	};

	let me = undefined;
	const getMe = () => fetch_json('GET', admin_url('/whoAmI')).then((x) => (me = x));
	getMe();

	let all_permissions = [];
	const getAllPermissionsFor = (n) =>
		fetch_json('POST', admin_url('/canEditPermissions'), { node: n, permission: 'read' }).then(
			(x) => (all_permissions = x)
		);
	const setPermission = (permission) => {
		setRestriction(
			permission.db,
			permission.collection,
			node_id,
			'read',
			JSON.parse(permission.read)
		);
	};

	let filter = '';

	$: filtered_collections = nodes.filter((x) => x.type == 'collection' && x._id.includes(filter));
	$: filtered_tags = nodes.filter((x) => x.type == 'tag' && x._id.includes(filter));
	$: filtered_users = nodes.filter((x) => x.type == 'user' && x._id.includes(filter));

	let node_id = undefined;
	$: node = nodes.filter((node) => node_id == node?._id)?.[0];
	$: node && !node.org && getAllPermissionsFor(node._id);
	$: parents = node ? getAll(node.parents) : [];
	$: children = node ? getAll(node.children) : [];
	$: admins = node ? getAll(node.admins) : [];
	$: adminedBy = node ? getAdminsOf(node._id) : [];
	$: title = node ? 'Admin - ' + node.type + ':' + node._id : 'Admin';

	const getAll = (ids) => nodes.filter((node) => ids?.includes(node._id));
	const getAdminsOf = (id) =>
		nodes.filter((user) => user.type == 'user' && user?.admins?.includes(id));
</script>

<svelte:head><title>{title}</title></svelte:head>

<div class="row">
	<div class="col-xs-2">
		<input bind:value={filter} />

		<h3>Collections</h3>
		<NodeList items={filtered_collections} on:selectItem={setNode} />
		{#if me?.canAddCollectionTo}
			<button on:click={() => (showAddCollection = true)}>Add New Collection</button>
		{/if}
		<h3>Tags</h3>
		<NodeList items={filtered_tags} on:selectItem={setNode} />

		<h3>Users</h3>
		<NodeList items={filtered_users} on:selectItem={setNode} />
	</div>

	<div class="col-xs-10">
		{#if node}
			<h2>
				<span class="{node.type} pill">{node._id}</span> -
				{#if node.type != 'user'}
					<DeleteButton {node} {nodes} {getData} />
				{/if}
			</h2>
			<h3>Parents</h3>
			<NodeList del items={parents} on:selectItem={setNode} />

			{#if node.type != 'user'}
				<h3>Children</h3>
				<NodeList del items={children} on:selectItem={setNode} />
				<button on:click={() => (showAddMaterialisedView = true)}>Add Materialised View</button>
				<button on:click={() => (showAddTag = true)}>Add Tag</button>
			{/if}

			<h3>Admined By</h3>
			<NodeList del items={adminedBy} on:selectItem={setNode} />
			<button on:click={() => (showAddAdmin = true)}>Add Admin</button>

			{#if node.type == 'user'}
				<h3>Admins</h3>
				<NodeList del items={admins} on:selectItem={setNode} />
			{/if}

			{#if node.type == 'collection'}
				<h3>Schema</h3>
				<Schema schema={JSON.stringify(node.schema, null, 2)} {node_id} on:saved={update} />
			{/if}

			<h3>Permissions</h3>
			{#if node.org}
				Orgs nodes don't have permissions.
			{:else}
				{#each all_permissions as permission}
					<h4>{permission.db} - {permission.collection}</h4>
					<textarea
						rows="4"
						cols="50"
						disabled={!permission.can_edit}
						bind:value={permission.read}
					/>
					<button
						disabled={!isValidPermission(permission)}
						on:click={() => setPermission(permission)}>Apply</button
					>
				{/each}
			{/if}
		{/if}
	</div>

	{#if showAddCollection}
		<Modal
			on:close={() => {
				showAddCollection = false;
				getData();
			}}
			let:close
		>
			<AddCollectionForm admin={me} {close} />
		</Modal>
	{/if}

	{#if showAddTag}
		<Modal
			on:close={() => {
				showAddTag = false;
				getData();
			}}
			let:close
		>
			<AddTagForm {nodes} {close} parent={node_id} />
		</Modal>
	{/if}

	{#if showAddMaterialisedView}
		<Modal
			on:close={() => {
				showAddMaterialisedView = false;
				getData();
			}}
			let:close
		>
			<AddMaterialisedViewForm admin={me} {close} />
		</Modal>
	{/if}

	{#if showAddAdmin}
		<Modal
			on:close={() => {
				showAddAdmin = false;
				getData();
			}}
			let:close
		>
			<AddAdminForm {nodes} {close} parent={node_id} />
		</Modal>
	{/if}
</div>
