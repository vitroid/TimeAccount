<script>
	import Slider from '@bulatdashiev/svelte-slider';
	import { huerange } from './color'



</script>

Color theme
<Slider max="360" step="10" bind:value={$huerange} range order />
