export default class UserService {

    apiConnector = null;
    exceptionsHandler = null;
    tokenService = null;

    currentUser = null;
    currentUserLastUpdate = null;

    constructor(apiConnector, exceptionsHandler, tokenService) {
        this.apiConnector = apiConnector;
        this.exceptionsHandler = exceptionsHandler;
        this.tokenService = tokenService;

        this.updateCurrentUser();
    }

    login() {

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const requestBodyJson = JSON.stringify({
            username: username,
            password: password
        });

        const response = this.apiConnector.sendRequest(
            "post",
            "/user/login",
            requestBodyJson
        );

        if(response.hasExceptions()) {
            this.exceptionsHandler.handleRegisterOrLoginExceptions(response);
        } else {
            this.tokenService.updateAccessToken(response.body["accessToken"]);
        }

        this.updateCurrentUser();
        return response;
    }

    register() {

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const requestBodyJson = JSON.stringify({
            username: username,
            password: password
        });

        const response = this.apiConnector.sendRequest(
            "post",
            "/user/",
            requestBodyJson
        );

        if(response.hasExceptions()) {
            this.exceptionsHandler.handleRegisterOrLoginExceptions(response);
        } else {
            this.tokenService.updateAccessToken(response.body["accessToken"]);
        }

        this.updateCurrentUser();
        return response;
    }

    getCurrentUser(forceUpdate = false) {

        if(!forceUpdate
            && this.currentUser
            && this.currentUserLastUpdate
            && (Date.now() - this.currentUserLastUpdate) / 1000 < 30) {
            return this.currentUser;
        }
        
        this.updateCurrentUser();
        return this.currentUser;
    }

    isUserLoggedIn() {
        const response = this.getCurrentUser();

        return !response.hasExceptions();
    }

    updateCurrentUser() {
        this.currentUser = this.apiConnector.sendRequest(
            "get",
            "/user"
        );
        this.currentUserLastUpdate = Date.now();
    }

    logout() {
        this.tokenService.removeAccessToken();
    }
}