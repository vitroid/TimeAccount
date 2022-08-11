<script>
    import { getContext } from 'svelte';
    import Gear from './gear.svelte';
    import SettingDialog from './SettingDialog.svelte';
    const { open } = getContext('simple-modal');
    const showSettingDialog = () => open(SettingDialog);
</script>

<!-- <Gear /> -->
<button on:click={showSettingDialog}><Gear /></button>

<style>
    button {
        /* font-size: 150%; */
        height: 30px;
        padding: 0;
        border-style: node;
    }
</style>
