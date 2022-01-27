import {addEventListener} from "./functions.mjs";

export default class EventListenersManager {

    removeLinksEventListeners = [];

    router = null;

    constructor(router) {
        this.router = router;

        window.addEventListener("popstate", (e) => this.popstateEventListener(e));
    }

    popstateEventListener(e) {
        this.router.handleRequest(window.location.pathname, null);
    }

    updateLinksEventListeners() {

        for(const removeEventListener of this.removeLinksEventListeners) {
            removeEventListener();
        }
        this.removeLinksEventListeners = [];

        document.querySelectorAll('a').forEach(
            element => {

                const removeEventListener = addEventListener(
                    element, "click",
                    (e) => this.linkEventListener(e)
                );

                this.removeLinksEventListeners.push(removeEventListener);
            }
        );
    }

    linkEventListener(e) {

        const href = e.currentTarget.getAttribute("href");

        if(href) {

            e.preventDefault();
            this.router.handleRequest(href);
        }
    }
}