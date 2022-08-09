<script type="ts">
    window.onSignIn = (googleUser) => {
       const profile = googleUser.getBasicProfile();
       console.log('ID: ' + profile.getId());
       console.log('Name: ' + profile.getName());
       console.log('Image URL: ' + profile.getImageUrl());
       console.log('Email: ' + profile.getEmail());
    };

</script>

  
<svelte:head>
    <script src="https://apis.google.com/js/platform.js" async defer></script>
    <script src="https://apis.google.com/js/platform.js?onload=onLoadCallback" async defer></script>
</svelte:head>

<!-- https://dev.to/safaiyeh/svelte-google-sign-in-out-3n1n -->
<div class="g-signin2" data-longtitle="true" data-onsuccess="onSignIn" />
