import Response from "./Response.mjs";
import {rootApiEndpoint} from "./functions.mjs";

export default class ApiConnector {

    tokenService = null;

    constructor(tokenService) {
        this.tokenService = tokenService;
    }

    sendRequest(method, apiRootRelativeUrl, requestBodyJson = "", addContentTypeHeader = true) {

        let response;

        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if(xhr.readyState === 4) {

                const responseBody = xhr.responseText !== "" ? JSON.parse(xhr.responseText) : {};
                response = new Response(xhr.status, responseBody);
            }
        }

        xhr.open(method, rootApiEndpoint() + apiRootRelativeUrl, false);

        if(this.tokenService.isAccessTokenPresent()) {
            xhr.setRequestHeader("Authorization", "Bearer " + this.tokenService.accessToken);
        }

        if(addContentTypeHeader) {
            xhr.setRequestHeader("Content-type", "application/json");
        }

        xhr.send(requestBodyJson);

        return response;
    }
}