<script>
	import AfterLogin from './Components/AfterLogin.svelte';
	// import { store } from './hooks/auth';
	import LoginComponent from './Components/LoginComponent.svelte';
	import { token } from './stores.ts';

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
{/if}

<style>
	:global(body) {
		background-color: #222;
		color: black;
		transition: background-color 0.3s
	}
	:global(body.dark-mode) {
		background-color: #1d3040;
		color: #bfc2c7;
	}
</style>
