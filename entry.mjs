import Controller from "./controller/Controller.mjs";
import View from "./view.mjs";
import TokenService from "./service/TokenService.mjs";
import ApiConnector from "./ApiConnector.mjs";
import ExceptionsHandler from "./ExceptionsHandler.mjs";
import UserService from "./service/UserService.mjs";
import EventListenersManager from "./EventListenersManager.mjs";
import ProductService from "./service/ProductService.mjs";
import MeasurementUniService from "./service/MeasurementUniService.js";
import UserController from "./controller/UserController.mjs";
import ProductController from "./controller/ProductController.mjs";
import Router from "./Router.mjs";
import GlobalController from "./controller/GlobalController.mjs";
import MealService from "./service/MealService.mjs";
import MealController from "./controller/MealController.mjs";
import ScheduleController from "./controller/ScheduleController.js";
import ScheduleService from "./service/ScheduleService.mjs";

const tokenService = new TokenService();
const apiConnector = new ApiConnector(tokenService);
const view = new View();
const mealService = new MealService(apiConnector);
const measurementUnitService = new MeasurementUniService(apiConnector);
const eventListenersManager = new EventListenersManager();
const exceptionsHandler = new ExceptionsHandler(view);
const userService = new UserService(apiConnector, exceptionsHandler, tokenService);
const controller = new Controller(userService, view, eventListenersManager);
exceptionsHandler.controller = controller;
apiConnector.controller = controller;
const productService = new ProductService(exceptionsHandler, apiConnector);
const scheduleService = new ScheduleService();
const scheduleController = new ScheduleController(
    userService,
    view,
    eventListenersManager,
    exceptionsHandler,
    mealService,
    scheduleService
);
const userController = new UserController(
    userService,
    view,
    eventListenersManager,
    exceptionsHandler
);
const productController = new ProductController(
    userService,
    view,
    eventListenersManager,
    productService,
    measurementUnitService
);
const mealController = new MealController(
    userService,
    view,
    eventListenersManager,
    mealService,
    measurementUnitService,
    productService
);
const globalController = new GlobalController(userService, view, eventListenersManager);

const router = new Router(userController, productController, globalController, mealController, scheduleController);

eventListenersManager.router = router;
controller.router = router;
userController.router = router;
productController.router = router;
globalController.router = router;
mealService.router = router;
mealService.mealController = mealController;
mealService.productService = productService;
mealService.measurementUnitService = measurementUnitService;
mealService.exceptionsHandler = exceptionsHandler;
mealController.router = router;
scheduleService.scheduleController = scheduleController;
scheduleService.apiConnector = apiConnector;
scheduleService.exceptionsHandler = exceptionsHandler;
scheduleService.router = router;

Handlebars.getTemplate = function(name) {
    if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
        const xhr = new XMLHttpRequest();
        xhr.open('get', '/RationPlanner-Web-Interface/templates/' + name + '.handlebars', false);

        xhr.onreadystatechange = function () {
            if(xhr.readyState === 4) {
                if(Handlebars.templates === undefined) {
                    Handlebars.templates = {};
                }

                Handlebars.templates[name] = Handlebars.compile(xhr.responseText);
            }
        }

        xhr.send();
    }

    return Handlebars.templates[name];
};

Handlebars.registerHelper('if_eq', function(a, b, opts) {
    if (a === b) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
});

Handlebars.registerHelper('if_any', function (value1, value2, opts) {
    if(value1 || value2) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
});

Handlebars.registerHelper('roundedPrice', function(price) {
    return price.toFixed(0);
});

let timer;

export function setUserLoginCheck() {

    if(timer) {
        unsetUserLoginCheck();
    }

    timer = window.setTimeout(
        () => {
            if(!userService.isUserLoggedIn()
                && window.location.pathname !== "RationPlanner-Web-Interface/login"
                && window.location.pathname !== "RationPlanner-Web-Interface/register") {
                exceptionsHandler.handleAccessTokenExpiration("Время действия вашей сессии истекло, войдите в аккаунт заново");
            }
        },
        15000
    );
}

export function unsetUserLoginCheck() {
    window.clearTimeout(timer);
}

router.handleRequest(window.location.pathname, "replace");
