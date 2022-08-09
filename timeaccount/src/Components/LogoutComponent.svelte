<script>
	// import { store } from '../hooks/auth';
    // const logout = () =>{$store=null}

	import { token, history, cats } from '../stores';

    const logout = () => { 
        token.set("")
        history.set([])
        cats.set({})
        signOut();
    }

    window.signOut = () => {
        const auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(() => {
          // User is now signed out
        });
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
