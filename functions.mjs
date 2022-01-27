import {API_DOMAIN, API_VERSION, PROTOCOL} from "./config.mjs";

export function rootApiEndpoint() {
    return PROTOCOL + "://" + API_DOMAIN + "/api/" + API_VERSION;
}

export function addEventListener(element, ...args) {
    element.addEventListener(...args);
    return () => element.removeEventListener(...args);
}

export function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}