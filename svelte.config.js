const sveltePreprocess = require("svelte-preprocess");
module.exports = {
	// By default, `npm run build` will create a standard Node app.
	// You can create optimized builds for different platforms by
	// specifying a different adapter
	preprocess: [ sveltePreprocess({ defaults: { style: "postcss" }, postcss: true }) ],
	adapter: '@sveltejs/adapter-node'
};