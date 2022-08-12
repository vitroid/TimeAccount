import { localStorageStore } from "@babichjacob/svelte-localstorage/browser";
export const darkMode = localStorageStore("darkMode", false);
