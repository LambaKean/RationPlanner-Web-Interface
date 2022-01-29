import {unsetUserLoginCheck} from "./entry.mjs";

export default class ExceptionsHandler {

    view = null;
    controller = null;

    constructor(view, controller) {
        this.view = view;
        this.controller = controller;
    }

    handleRegisterOrLoginExceptions(response) {

        const exceptions = response.body["exceptions"];

        const exceptionsContainer = document.getElementById("errors");
        exceptionsContainer.innerHTML = "";

        for (const exception of exceptions) {
            exceptionsContainer.innerHTML += this.view.render("exception", exception);
        }
    }

    handleEntityNotFoundException(response, data = {}) {
        this.controller.switchTemplate("notFoundPage", data);

        document.getElementById("button").addEventListener("click", () => window.history.back());
    }

    handleUserNotLoggedInException(response) {
        const handledException = response.getExceptionByCode("userNotLoggedIn");

        this.controller.userService.logout();

        this.controller.switchTemplate(
            "userNotLoggedIn",
            {message: handledException.message}
        );

        unsetUserLoginCheck();

        document.getElementById("button").addEventListener("click", () => window.history.back());
    }

    handleAccessTokenExpiration(msg) {

        this.controller.userService.logout();

        this.controller.switchTemplate(
            "userNotLoggedIn",
            {message: msg}
        );

        unsetUserLoginCheck();

        document.getElementById("button").addEventListener("click", () => window.history.back());
    }

    handleAccessDeniedException(response) {

        const handledException = response.getExceptionByCode("accessDenied");

        this.controller.switchTemplate(
            "accessDenied",
            {message: handledException.message}
        );

        document.getElementById("button").addEventListener("click", () => window.history.back());
    }

    handleCreateNewProductExceptions(response) {

        const errorsContainer = document.getElementById("errors");
        errorsContainer.innerHTML = "";

        for(const exception of response.body["exceptions"]) {
            const exceptionP = document.createElement("p");
            exceptionP.classList.add("error");
            exceptionP.innerText = exception["message"];

            errorsContainer.appendChild(exceptionP);
        }
    }

    handleDeleteProductExceptions(response) {

        const errorsContainer = document.getElementById("errors");
        errorsContainer.innerHTML = "";

        for(const exception of response.body["exceptions"]) {
            const exceptionP = document.createElement("p");
            exceptionP.classList.add("error");
            exceptionP.innerText = exception["message"];

            errorsContainer.appendChild(exceptionP);
        }
    }

    handleCreateMealExceptions(response) {

        const errorsContainer = document.getElementById("errors");
        errorsContainer.innerHTML = "";

        for(const exception of response.body["exceptions"]) {
            const exceptionP = document.createElement("p");
            exceptionP.classList.add("error");
            exceptionP.innerText = exception["message"];

            errorsContainer.appendChild(exceptionP);
        }
    }

    handleDeleteMealExceptions(response) {

        const errorsContainer = document.getElementById("errors");
        errorsContainer.innerHTML = "";

        for(const exception of response.body["exceptions"]) {
            const exceptionP = document.createElement("p");
            exceptionP.classList.add("error");
            exceptionP.innerText = exception["message"];

            errorsContainer.appendChild(exceptionP);
        }
    }

    handleExceptionsDefaultWay(response) {

        const errorsContainer = document.getElementById("errors");
        errorsContainer.innerHTML = "";

        for(const exception of response.body["exceptions"]) {
            const exceptionP = document.createElement("p");
            exceptionP.classList.add("error");
            exceptionP.innerText = exception["message"];

            errorsContainer.appendChild(exceptionP);
        }
    }

}