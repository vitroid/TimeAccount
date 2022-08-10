<script>
	import { token, history, cats } from '../stores';

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
        color: #000;
        height: 30px;
    }
</style>
