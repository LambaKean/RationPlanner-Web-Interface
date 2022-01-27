import Controller from "./Controller.mjs";

export default class GlobalController extends Controller {

    constructor(userService, view, eventListenersManager, router) {
        super(userService, view, eventListenersManager, router);
    }

    loadNotFoundPage(context) {
        super.switchTemplate(
            "notFoundPage",
            {message: "Страницы с указанным адресом не существует."}
        );

        this.performSideTasks(context);

        document.getElementById("button").addEventListener("click", () => window.history.back());
    }
}