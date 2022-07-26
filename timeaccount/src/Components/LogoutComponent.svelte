<script>
	// import { store } from '../hooks/auth';
    // const logout = () =>{$store=null}

	import { token } from '../stores';
    const logout = () => { token.set("") }
</script>

<button on:click={logout}>
    Logout
</button>


<style>
    button {
        left:120px;
        top: 10px;
        text-align:center;
        color: #000;
    }
</style>
