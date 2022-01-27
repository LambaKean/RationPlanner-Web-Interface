export default class TokenService {

    accessToken = null;

    constructor() {
        if(localStorage.getItem("accessToken")) {
            this.accessToken = localStorage.getItem("accessToken");
        }
    }

    updateAccessToken(accessToken) {
        this.accessToken = accessToken;
        localStorage.setItem("accessToken", accessToken);
    }

    removeAccessToken(accessToken) {
        localStorage.removeItem("accessToken");
        this.accessToken = null;
    }

    isAccessTokenPresent() {
        return this.accessToken !== null;
    }
}