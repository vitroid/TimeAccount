<script>
	import AfterLogin from './Components/AfterLogin.svelte';
	// import { store } from './hooks/auth';
	import { token } from './stores';
	import LoginComponent from './Components/LoginComponent.svelte';

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
