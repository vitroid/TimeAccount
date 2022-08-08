<script>
  import { getContext } from 'svelte';
  import SettingDialog from './SettingDialog.svelte';
//   import Gear from './gear.svelte';
  const { open } = getContext('simple-modal');
  const showSettingDialog = () => open(SettingDialog);
</script>

<!-- <Gear /> -->
<button on:click={showSettingDialog}>Setting</button>

<style>
    button {
        /* font-size: 150%; */
        height: 30px;
    }
</style>