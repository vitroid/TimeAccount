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
	<LoginComponent />
	<SignUp />
{/if}
