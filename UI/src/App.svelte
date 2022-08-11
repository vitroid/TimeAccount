<script>
	import AfterLogin from './Components/AfterLogin.svelte';
	// import { store } from './hooks/auth';
	// import { theme } from './color';
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
