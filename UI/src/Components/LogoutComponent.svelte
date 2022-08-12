<script>
	// import { store } from '../hooks/auth';
    // const logout = () =>{$store=null}

	import { cats,history,token } from '../stores';
    const logout = () => {
        token.set("")
        history.set([])
        cats.set({})
    }
</script>

<button on:click={logout}>
    Logout
</button>


<style>
    button {
        /* left:120px;
        top: 10px; */
        text-align:center;
        /* color: #000; */
        height: 30px;
		background: var(--bg-color);
		border: none;
        color: var(--text-color);
    }
</style>
