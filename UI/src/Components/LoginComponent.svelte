<script>
	// import { getUserDetails } from '../hooks/auth';
	// import { store } from '../hooks/auth';
    import { getToken } from '../stores';

	let username = '';
	let password = '';
	let error = ''

	async function login() {
		// const user = await getUserDetails( username, password )
		let tok;
        getToken( username, password ).then((tok)=>{
			if ( tok ) {
				if ( error ) error = ''
			}
			else {
				error = 'Incorrect username and password.'
				console.log("Incorrect username and password.")
			}
		})
	}

</script>

<form on:submit|preventDefault={login} class="flex mx-auto col-6">

	<div class="mb-3">
		<label for="username" class="form-label">Username</label>
		<!-- <input type="email" class="form-control" id="username" bind:value={username} /> -->
		<input type="text" class="form-control" id="username" bind:value={username} autocomplete="username"/>
	</div>

	<div class="mb-3">
		<label for="password" class="form-label">Password</label>
		<input type="password" class="form-control" id="password" bind:value={password} />
	</div>

	<button type="submit" class="btn btn-primary">Submit</button>
	<div id="error_message" class="text-danger">
		<small>{error}</small>
	</div>

</form>

<style>
	.mb-3 {
        background: var(--bg-color);
		border: none;
        color: var(--text-color);
	}
    form {
        max-width: 480px;
        text-align: center;
        padding: 1em;
        margin: 0 auto;
    }
</style>
