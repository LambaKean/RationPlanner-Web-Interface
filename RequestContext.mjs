export default class RequestContext {

    url = null;
    pageTitle = null;
    historyStateAction = null;  // "push" => pushState, "replace" => replaceState, else nothing

    constructor(url, pageTitle, historyStateAction) {
        this.url = url;
        this.pageTitle = pageTitle;
        this.historyStateAction = historyStateAction;
    }
}