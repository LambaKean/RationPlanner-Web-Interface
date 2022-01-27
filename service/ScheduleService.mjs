import {pad} from "../functions.mjs";

export default class ScheduleService {

    newPlannedDayMeals = [];

    scheduleController = null;
    apiConnector = null;
    exceptionsHandler = null;
    router = null;

    constructor(scheduleController, apiConnector, exceptionsHandler, router) {
        this.scheduleController = scheduleController;
        this.apiConnector = apiConnector;
        this.exceptionsHandler = exceptionsHandler;
        this.router = router;
    }

    appendMeal() {

        const form = document.querySelector('[data-template="newMealForm"]');

        if (!form) {
            return;
        }

        const errorsContainer = document.getElementById("new-meal-errors");
        errorsContainer.innerHTML = "";

        let hours = document.getElementById("hours").value;
        let minutes = document.getElementById("minutes").value;

        if ((!hours || parseInt(hours) < 0 || parseInt(hours) > 23)) {
            const errorDiv = document.createElement("div");
            errorDiv.classList.add("error");
            errorDiv.innerText = "Время начала готовки указано неверно";
            errorsContainer.appendChild(errorDiv);
            return;
        } else {
            hours = parseInt(hours)
        }

        if ((!minutes || parseInt(minutes) < 0 || parseInt(minutes) > 59)) {
            const errorDiv = document.createElement("div");
            errorDiv.classList.add("error");
            errorDiv.innerText = "Время начала готовки указано неверно";
            errorsContainer.appendChild(errorDiv);
            return;
        } else {
            minutes = parseInt(minutes)
        }

        const newMealSelect = document.getElementById("new-meal");
        const newMealId = newMealSelect.value;
        const newMealName = newMealSelect.options[newMealSelect.selectedIndex].text;

        if (!newMealId) {
            const errorDiv = document.createElement("div");
            errorDiv.classList.add("error");
            errorDiv.innerText = "Вы должны выбрать блюдо";
            errorsContainer.appendChild(errorDiv);
            return;
        }

        const plannedDayMealDtoWrapper = {
            mealName: newMealName,
            dto: {
                mealId: newMealId,
                time: {
                    hours: hours,
                    minutes: minutes
                }
            }
        }

        this.newPlannedDayMeals.push(plannedDayMealDtoWrapper);

        this.scheduleController.removeTemplate("newMealForm");
        this.scheduleController.updateCreatePlannedDayPageEventListeners();

        this.renderPlannedDayMealsList();
    }

    renderPlannedDayMealsList() {

        document.querySelectorAll(".meal-row.actual-meal").forEach(element => element.remove());

        const container = document.getElementById("meals-container");

        let i = 0;
        for (const plannedDayMealDto of this.newPlannedDayMeals) {

            container.innerHTML += `
                <div class="meal-row actual-meal">
                    <div class="time">${pad(plannedDayMealDto.dto.time.hours, 2)}:${pad(plannedDayMealDto.dto.time.minutes, 2)}</div>
                    <div class="meal-name">
                        ${plannedDayMealDto.mealName}
                        <input data-index=${i} type="button" class="button red-button delete-button" value="-">
                    </div>
                </div>
            `

            i++;
        }

        this.scheduleController.updateCreatePlannedDayPageEventListeners();
    }

    removePlannedDayMeal(element) {

        const index = parseInt(element.dataset.index);

        this.newPlannedDayMeals.splice(index, 1);

        this.renderPlannedDayMealsList();
        this.scheduleController.updateCreatePlannedDayPageEventListeners();
    }

    savePlannedDay() {

        const name = document.getElementById("name").value;

        const dtos = [];

        for(const wrapper of this.newPlannedDayMeals) {
            dtos.push(wrapper.dto);
        }

        const plannedDayDto = {
            name: name,
            plannedDayMeals: dtos
        }

        console.log(plannedDayDto)

        const createPlannedDayResponse = this.apiConnector.sendRequest(
            "post",
            "/plannedDay",
            JSON.stringify(plannedDayDto)
        );

        if(createPlannedDayResponse.hasExceptions()) {
            if(createPlannedDayResponse.hasExceptionWithCode("userNotLoggedIn")) {
                this.exceptionsHandler.handleUserNotLoggedInException(createPlannedDayResponse);
            } else {
                this.exceptionsHandler.handleExceptionsDefaultWay(createPlannedDayResponse);
            }
        } else {
            this.router.handleRequest("/plannedDay");
        }
    }

    getCurrentUserPlannedDays() {

        const response = this.apiConnector.sendRequest("get", "/plannedDay");

        if(response.hasExceptionWithCode("userNotLoggedIn")) {
            this.exceptionsHandler.handleUserNotLoggedInException(response);
        }

        return response;
    }

    getPlannedDayById(id) {

        const response = this.apiConnector.sendRequest("get", "/plannedDay/" + id);

        if(response.hasExceptions()) {
            if(response.hasExceptionWithCode("entityNotFound")) {

                this.exceptionsHandler.handleEntityNotFoundException(
                    response,
                    {message: "Запрошенный вами день не был найден"}
                );

            } else if (response.hasExceptionWithCode("userNotLoggedIn")) {

                this.exceptionsHandler.handleUserNotLoggedInException(response);

            } else if(response.hasExceptionWithCode("accessDenied")) {

                this.exceptionsHandler.handleAccessDeniedException(response);

            }
        }

        return response;
    }

    deletePlannedDay(id) {

        const response = this.apiConnector.sendRequest("delete", "/plannedDay/" + id);

        if(!response || !response.hasExceptions()) {
            this.router.handleRequest("/plannedDay");
        } else {
            this.exceptionsHandler.handleExceptionsDefaultWay(response);
        }

    }

    getMonthSchedule(monthNumber, yearNumber) {

        const response = this.apiConnector.sendRequest(
            "get",
            `/schedule?date=01${pad(monthNumber, 2)}${yearNumber}`
        );

        if(response.hasExceptions()) {
            if(response.hasExceptionWithCode("userNotLoggedIn")) {
                this.exceptionsHandler.handleUserNotLoggedInException(response);
            }
        }

        return response;
    }

    getScheduleById(id) {

        const response = this.apiConnector.sendRequest(
            "get",
            "/schedule/" + id
        );

        if(response.hasExceptions()) {
            if(response.hasExceptionWithCode("userNotLoggedIn")) {
                this.exceptionsHandler.handleUserNotLoggedInException(response);
            } else {
                this.exceptionsHandler.handleExceptionsDefaultWay(response);
            }
        }

        return response;
    }

    deleteSchedule(id) {

        const response = this.apiConnector.sendRequest(
            "delete",
            "/schedule/" + id
        );

        if(response.hasExceptions()) {
            if(response.hasExceptionWithCode("userNotLoggedIn")) {
                this.exceptionsHandler.handleUserNotLoggedInException(response);
            } else {
                this.exceptionsHandler.handleExceptionsDefaultWay(response);
            }
        }

        return response;
    }

    saveSchedule() {

        const day = parseInt(document.getElementById("day").value);
        const month = parseInt(document.getElementById("month").value);
        const year = parseInt(document.getElementById("year").value);

        const plannedDayId = document.getElementById("planned-day-select").value;

        const repeat = parseInt(document.getElementById("repeat").value);



        const response = this.apiConnector.sendRequest(
            "post",
            "/schedule",
            JSON.stringify({
                plannedDay: {
                    id: plannedDayId
                },
                startDate: {
                    year: year,
                    month: month,
                    day: day
                },
                nextRepeatAfterDays: repeat
            })
        );

        if(response.hasExceptions()) {
            if(response.hasExceptionWithCode("userNotLoggedIn")) {
                this.exceptionsHandler.handleUserNotLoggedInException(response);
            } else {
                this.exceptionsHandler.handleExceptionsDefaultWay(response);
            }
        }

        return response;
    }
}