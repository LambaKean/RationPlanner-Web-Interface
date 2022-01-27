import Controller from "./Controller.mjs";

export default class UserController extends Controller {

    exceptionsHandler = null;

    constructor(userService, view, eventListenersManager, exceptionsHandler, router) {
        super(userService, view, eventListenersManager, router);
        this.exceptionsHandler = exceptionsHandler;
    }

    loadProfilePage(context) {

        const currentUserResponse = this.userService.getCurrentUser();

        if(currentUserResponse.hasExceptions()) {
            if(currentUserResponse.hasExceptionWithCode("userNotLoggedIn")) {
                this.exceptionsHandler.handleUserNotLoggedInException(currentUserResponse);
            }
        } else {

            this.switchTemplate("profilePage", currentUserResponse.body);
        }

        this.performSideTasks(context);

        document.getElementById("logout-button").addEventListener(
            "click",
            () => this.logout()
        );
    }

    logout() {
        this.userService.logout();
        this.router.handleRequest("/login");
    }

    loadLoginPage(context) {

        this.switchTemplate("loginPage");

        this.performSideTasks(context);

        document.getElementById("loginButton").addEventListener(
            "click",
            () => this.login()
        );
    }

    login() {

        const response = this.userService.login();

        if(!response.hasExceptions()) {
            this.router.handleRequest("/profile");
        }
    }

    loadRegisterPage(context) {

        this.switchTemplate("registerPage");

        this.performSideTasks(context);

        document.getElementById("registerButton").addEventListener(
            "click",
            () => this.register()
        );
    }

    register () {

        const response = this.userService.register();

        if(!response.hasExceptions()) {
            this.router.handleRequest("/profile");
        }
    }
}