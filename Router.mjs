import RequestContext from "./RequestContext.mjs";
import {setUserLoginCheck, unsetUserLoginCheck} from "./entry.mjs";

export default class Router {

    routes = [
        {
            urlRegexp: "^\/login\/?$",
            title: "Вход в аккаунт",
            handler: (context) => this.userController.loadLoginPage(context)
        },
        {
            urlRegexp: "^\/register\/?$",
            title: "Регистрация аккаунта",
            handler: (context) => this.userController.loadRegisterPage(context)
        },
        {
            urlRegexp: "^\/profile\/?$",
            title: "Профиль",
            handler: (context) => this.userController.loadProfilePage(context)
        },
        {
            urlRegexp: "^\/$",
            title: "Профиль",
            handler: (context) => this.userController.loadProfilePage(context)
        },
        {
            urlRegexp: "^\/product\/new\/?$",
            title: "Добавление продукта",
            handler: (context) => this.productController.loadCreateProductPage(context)
        },
        {
            urlRegexp: "^\/product\/[a-zA-z0-9-]+\/?$",
            title: "Продукт",
            handler: (context) => this.productController.loadProductPage(context)
        },
        {
            urlRegexp: "^\/product\/?$",
            title: "Мои продукты",
            handler: (context) => this.productController.loadProductsListPage(context)
        },
        {
            urlRegexp: "^\/meal\/new\/?$",
            title: "Добавление блюда",
            handler: (context) => this.mealController.loadCreateMealPage(context)
        },
        {
            urlRegexp: "^\/meal\/[a-zA-z0-9-]+\/?$",
            title: "Блюдо",
            handler: (context) => this.mealController.loadMealPage(context)
        },
        {
            urlRegexp: "^\/meal\/?$",
            title: "Мои бюда",
            handler: (context) => this.mealController.loadMealsListPage(context)
        },
        {
            urlRegexp: "^\/schedule\/?$",
            title: "Моё расписание",
            handler: (context) => this.scheduleController.loadMonthSchedulePage(context)
        },
        {
            urlRegexp: "^\/plannedDay\/?$",
            title: "Мои дни",
            handler: (context) => this.scheduleController.loadPlannedDaysListPage(context)
        },
        {
            urlRegexp: "^\/plannedDay\/new\/?$",
            title: "Создание дня",
            handler: (context) => this.scheduleController.loadCreatePlannedDayPage(context)
        },
        {
            urlRegexp: "^\/plannedDay\/[a-zA-z0-9-]+\/?$",
            title: "День",
            handler: (context) => this.scheduleController.loadPlannedDayPage(context)
        },
    ]

    userController = null;
    productController = null;
    globalController = null;
    mealController = null;
    scheduleController = null;

    constructor(userController, productController, globalController, mealController, scheduleController) {
        this.userController = userController;
        this.productController = productController;
        this.globalController = globalController;
        this.mealController = mealController;
        this.scheduleController = scheduleController;
    }

    handleRequest(url, historyStateAction = "push") {

        for(const route of this.routes) {

            const regexp = new RegExp(route.urlRegexp);

            if(regexp.test(url)) {

                if(url === "/login" || url === "/register") {
                    unsetUserLoginCheck();
                } else {
                    setUserLoginCheck();
                }

                route.handler(new RequestContext(url, route.title, historyStateAction));

                return;
            }
        }

        this.globalController.loadNotFoundPage(
            new RequestContext(url, "404 Page Not Found", historyStateAction)
        );
    }

}