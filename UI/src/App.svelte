<script>
	import AfterLogin from './Components/AfterLogin.svelte';
	// import { store } from './hooks/auth';
	// import { theme } from './color';
	import { onMount } from 'svelte';
	import { darkMode } from './Components/darkmode';
	import LoginComponent from './Components/LoginComponent.svelte';
	import SignUp from './SignUp.svelte';
	import { token } from './stores.ts';

	onMount( () => {
		if ( $darkMode ){
			window.document.body.classList.add('dark')
		}
		else {
			window.document.body.classList.remove('dark')
		}
	});
	//
</script>

<svelte:head>
	<title>TimeAccount 2022</title>
	<meta name="robots" content="noindex nofollow" />
	<html lang="en" />
</svelte:head>


{#if $token != "" }
	<AfterLogin />
{:else }
	<div class="container">
		<div class="panel">
			<h1>User sign in</h1>
			<LoginComponent />
		</div>
		<div class="panel">
			<h1>Sign Up</h1>
			<SignUp />
		</div>
	</div>
{/if}

<style>
	.container {
		display: flex;
		flex-flow: row;
		justify-content: center;
		flex-wrap: wrap;
	}
	.panel {
		margin: 5px;
		border: 1px solid #888;
		border-radius: 15px;
	}
	h1 {
		text-align: center;
	}
</style>
