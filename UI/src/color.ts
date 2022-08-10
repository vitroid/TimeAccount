import { writable, get } from 'svelte/store';
export const palettes = writable([])
// export const huerange = writable([0,54])

import { localStorageStore } from "@babichjacob/svelte-localstorage/browser";
export const huerange = localStorageStore("huerange", [0,54]);


export function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function palette(n){
    if ( n < 0 ){
        return "#ccc"
    }
    let ra = get(huerange)
    let hue = (ra[0] + n*(ra[1]-ra[0])) % 360
    let s=30
    let v=50
    return hslToHex(hue, s, v)
}

huerange.subscribe(values=>{
    let pals = []
    for(let i=0; i<50; i++){
        pals = [...pals, palette(i)]
    }
    palettes.set(pals)
})



