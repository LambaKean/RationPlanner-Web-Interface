import {CLIENT_ROOT_URL} from "../config.mjs";

export default class Controller {

    navbarLinks = [
        {
            title: "Профиль",
            href: "/profile",
            status: "inactive",
            showLinkPredicate: () => {
                return this.userService.isUserLoggedIn();
            },
        },
        {
            title: "Вход",
            href: "/login",
            status: "inactive",
            showLinkPredicate: () => {
                return !this.userService.isUserLoggedIn();
            }
        },
        {
            title: "Регистрация",
            href: "/register",
            status: "inactive",
            showLinkPredicate: () => {
                return !this.userService.isUserLoggedIn();
            }
        },
        {
            title: "Расписание",
            href: "/schedule",
            status: "inactive",
            showLinkPredicate: () => {
                return this.userService.isUserLoggedIn();
            }
        },
        {
            title: "Блюда",
            href: "/meal",
            status: "inactive",
            showLinkPredicate: () => {
                return this.userService.isUserLoggedIn();
            }
        },
        {
            title: "Продукты",
            href: "/product",
            status: "inactive",
            showLinkPredicate: () => {
                return this.userService.isUserLoggedIn();
            }
        },
        {
            title: "Дни",
            href: "/plannedDay",
            status: "inactive",
            showLinkPredicate: () => {
                return this.userService.isUserLoggedIn();
            }
        },

    ]

    currentUrl = null;

    userService = null;
    view = null;
    eventListenersManager = null;
    router = null;

    constructor(userService, view, eventListenersManager, router) {
        this.userService = userService;
        this.view = view;
        this.eventListenersManager = eventListenersManager;
        this.router = null;
    }

    performSideTasks(context) {

        this.currentUrl = context.url;

        this.setPageTitle(context.pageTitle);

        switch (context.historyStateAction) {
            case "push": history.pushState({}, context.pageTitle, CLIENT_ROOT_URL + context.url); break;
            case "replace": history.replaceState({}, context.pageTitle, CLIENT_ROOT_URL + context.url); break;
            default: break;
        }

        this.updateNavbar();
        this.eventListenersManager.updateLinksEventListeners();
    }

    setPageTitle(title) {

        const pageTitleContainer = document.getElementById('page-title');

        if(pageTitleContainer) {
            pageTitleContainer.innerText = title;
        }

        document.title = title + " - Ration Planner";
    }

    updateNavbar() {

        const navbarLinksContainer = document.getElementById("navbar-links-container");

        if(navbarLinksContainer) {
            navbarLinksContainer.innerHTML = "";

            for(const link of this.navbarLinks) {

                link.status = link.href === this.currentUrl ? "active" : "inactive";

                if(link.showLinkPredicate()) {
                    navbarLinksContainer.innerHTML += this.view.render("navbarLink", link);
                }
            }
        }
    }

    switchTemplate(templateName, templateData) {

        const templateHtml = this.view.render(templateName, templateData);

        const pageContentContainer = document.getElementById("payload-content");

        if(pageContentContainer) {
            pageContentContainer.innerHTML = templateHtml;
        }
    }

    appendTemplate(templateName, templateData = {}) {

        const templateHtml = this.view.render(templateName, templateData);
        const pageContentContainer = document.getElementById("payload-content");

        if(pageContentContainer) {
            pageContentContainer.insertAdjacentHTML( 'beforeend', templateHtml);
        }
    }

    removeTemplate(templateName) {
        document.querySelector(`[data-template="${templateName}"]`).remove();
    }
}