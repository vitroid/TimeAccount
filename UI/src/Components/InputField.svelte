<script lang="ts" >
    export let inputtext;
    export let placeholder;

    // function onKeyDown (e) {
    //     if (e.key == "Enter"){
    //         update(inputtext)
    //     }
    //     // inputtext = ""
    // }
    function expand(e){

    }
</script>


<input bind:value={inputtext} placeholder={placeholder} />
<!-- on:keydown={onKeyDown} /> -->

<style>
    input {
        margin: 0;
        background-color: #0000;
        color: white;
        border-radius: 999px;
        transition: width 1s;
        width: 30px;
        height: 30px;
    }

    input:hover, input:focus{
        width:197px;
    }


</style>
