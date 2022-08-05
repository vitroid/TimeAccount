function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

export function palette(n){
    if ( n < 0 ){
        return "#ccc"
    }
    let hue = n * (Math.sqrt(5)-1) / 2 / 3
    hue = (hue * 360) % 360
    let s=30
    let v=50
    return hslToHex(hue, s, v)
}
