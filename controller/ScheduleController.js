import Controller from "./Controller.mjs";
import {addEventListener, pad} from "../functions.mjs";

export default class ScheduleController extends Controller {

    removeEventListeners = [];

    calendar = null;
    currentCalendarDate = null;

    mealService = null;
    scheduleService = null;

    constructor(userService, view, eventListenersManager, router, mealService, scheduleService) {
        super(userService, view, eventListenersManager, router);
        this.mealService = mealService;
        this.scheduleService = scheduleService;
    }

    getFirstDayOfMonthNumber(date) {
        let day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();

        return day !== 0 ? day : 7;
    }

    getAmountOfDaysInMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }

    loadMonthSchedulePage(context) {

        this.switchTemplate("monthSchedule");

        this.performSideTasks(context);

        this.renderCalendar(new Date());
    }

    renderCalendar(date) {

        const months = ["Январь", "Февраль", "Март",
            "Апрель", "Май", "Июнь",
            "Июль", "Август", "Сентябрь",
            "Октябрь", "Ноябрь", "Декабрь"];


        document.getElementById("month-name-placeholder").innerText = months[date.getMonth()];
        document.getElementById("year-placeholder").innerText = date.getFullYear();

        const calendarBody = document.getElementById("calendar-body");
        calendarBody.innerHTML = "";

        const monthScheduleResponse = this.scheduleService.getMonthSchedule(
            date.getMonth() + 1,
            date.getFullYear()
        );

        this.currentCalendarDate = date;

        for(let i = 1; i < this.getFirstDayOfMonthNumber(date); i++) {
            calendarBody.innerHTML +=
                `
                    <div class="calendar-cell blank"></div>
                `
        }

        let calendar = {};

        for(let i = 1; i <= this.getAmountOfDaysInMonth(date); i++) {

            calendar[i] = [];

            for(let scheduledPlannedDay of monthScheduleResponse.body) {
                if(scheduledPlannedDay.date.day === i) {
                    calendar[i].push(scheduledPlannedDay);
                }
            }
        }

        this.calendar = calendar;

        for(const day of Object.keys(calendar)) {

            if(calendar[day].length === 0) {
                calendarBody.innerHTML +=
                    `
                        <div class="calendar-cell" data-day="${day}">
                            <div class="day-number">${day}</div>
                        </div>
                    `;
            } else {

                let markup =
                    `
                    <div class="calendar-cell" data-day="${day}">
                    
                        <div class="day-number">${day}</div>
                        <div class="day-name">${calendar[day][0].plannedDay.name}</div>
                `

                if(calendar[day].length > 1) {
                    markup +=
                        `
                            <div class="cell-controls-row">
                                <div class="cell-button" data-day="${day}"></div>
                                <div class="day-price">${Math.round(calendar[day][0].plannedDay.price)}р.</div>
                                <div class="cell-button" data-day="${day}" data-index="${0}"></div>
                            </div>
                        
                        </div>
                    `
                } else {
                    markup +=
                        `
                            <div class="cell-controls-row">
                                <div class="day-price">${Math.round(calendar[day][0].plannedDay.price)}р.</div>
                            </div>
                            
                        </div>
                    `
                }

                calendarBody.innerHTML += markup;
            }

        }

        this.updateMonthScheduleEventListeners();
    }

    updateMonthScheduleEventListeners() {

        for(const removeEventListener of this.removeEventListeners) {
            removeEventListener();
        }

        this.removeEventListeners = [];

        const dayScheduleFormIsActive = !!document.querySelector('[data-template="dayScheduleForm"]');
        const createScheduleFormIsActive = !!document.querySelector('[data-template="createScheduleForm"]');

        if(dayScheduleFormIsActive) {
            document.querySelectorAll(".delete-schedule-button").forEach(
                (button) => {
                    this.removeEventListeners.push(
                        addEventListener(
                            button,
                            "click",
                            (event) => this.deleteSchedule(event)
                        )
                    );
                }
            );

            document.getElementById("close-form-button").addEventListener(
                "click",
                () => {
                    this.removeTemplate("dayScheduleForm");

                    this.updateMonthScheduleEventListeners();
                }
            );

            document.getElementById("add-schedule-button").addEventListener(
                "click",
                (event) => this.openCreateScheduleForm(event)
            );
        }
        else if(createScheduleFormIsActive) {

            document.getElementById("close-form-button").addEventListener(
                "click",
                () => {
                    this.removeTemplate("createScheduleForm");

                    this.updateMonthScheduleEventListeners();
                }
            );

            document.getElementById("save-schedule-button").addEventListener(
                "click",
                () => this.saveSchedule()
            );
        }
        else {
            document.querySelectorAll(".cell-button")
                .forEach((button) => {
                    this.removeEventListeners.push(
                        addEventListener(
                            button,
                            "click",
                            (event) => this.switchPlannedDayInCell(event, button)
                        )
                    );
                });

            document.querySelectorAll(".header-calendar-button")
                .forEach((button) => {
                    this.removeEventListeners.push(
                        addEventListener(
                            button,
                            "click",
                            () => this.switchMonth(button.dataset.action)
                        )
                    );
                });

            document.querySelectorAll(".calendar-cell:not(.blank)")
                .forEach((cell) => {
                    this.removeEventListeners.push(
                        addEventListener(
                            cell,
                            "click",
                            (event) => this.openDayScheduleForm(event)
                        )
                    );
                });
        }
    }

    saveSchedule() {

        const response = this.scheduleService.saveSchedule();

        if(!response.hasExceptions()) {

            this.removeTemplate("createScheduleForm");

            this.renderCalendar(this.currentCalendarDate);
        }
    }

    openCreateScheduleForm(event) {

        const day = event.currentTarget.dataset.day;

        const plannedDaysResponse = this.scheduleService.getCurrentUserPlannedDays();

        const data = {
            date: {
                day: day,
                month: this.currentCalendarDate.getMonth() + 1,
                year: this.currentCalendarDate.getFullYear()
            },
            plannedDays: plannedDaysResponse.body
        };

        this.removeTemplate("dayScheduleForm");

        this.appendTemplate("createScheduleForm", data);

        this.updateMonthScheduleEventListeners();
    }

    deleteSchedule(event) {

        event.preventDefault();
        event.stopPropagation();

        const button = event.currentTarget;

        const id = button.dataset.scheduleId;

        const response = this.scheduleService.deleteSchedule(id);

        if(!response.hasExceptions()) {
            this.removeTemplate("dayScheduleForm");

            this.renderCalendar(this.currentCalendarDate);
        }
    }

    openDayScheduleForm(event, data = {}) {

        if(!event.currentTarget.classList.contains("calendar-cell")) {
            return;
        }

        const day = parseInt(event.currentTarget.dataset.day);

        data.day = day;

        const displayableDay = pad(day, 2);
        const displayableMonth = pad(this.currentCalendarDate.getMonth() + 1, 2);
        const displayableYear = this.currentCalendarDate.getFullYear();

        data.displayableDate =
            `${displayableDay}.${displayableMonth}.${displayableYear}`;


        let schedules = [];

        for(const scheduledPlannedDayDto of this.calendar[day]) {

            const scheduleResponse = this.scheduleService.getScheduleById(scheduledPlannedDayDto.scheduleId);

            if(!scheduleResponse.hasExceptions()) {
                schedules.push(scheduleResponse.body);
            }
        }

        data.schedules = schedules;

        this.appendTemplate("dayScheduleForm", data);

        this.updateMonthScheduleEventListeners();
    }

    switchMonth(action) {

        let newMonth, newYear;

        if(action === 'prev') {

            newMonth = this.currentCalendarDate.getMonth() - 1;
            newYear = this.currentCalendarDate.getFullYear();

            if(newMonth === -1) {
                newMonth = 11;
                newYear = newYear - 1;
            }
        } else {

            newMonth = this.currentCalendarDate.getMonth() + 1;
            newYear = this.currentCalendarDate.getFullYear();

            if(newMonth === 12) {
                newMonth = 0;
                newYear = newYear + 1;
            }
        }

        this.renderCalendar(new Date(newYear, newMonth))
    }

    switchPlannedDayInCell(event, button) {

        event.stopPropagation();

        const day = button.dataset.day;
        const index = parseInt(button.dataset.index);

        const plannedDays = this.calendar[day];

        const newIndex = index + 1 !== plannedDays.length ? index + 1 : 0;

        const chosenPlannedDay = plannedDays[newIndex];

        document.querySelector(`.calendar-cell[data-day="${day}"]`).innerHTML =
            `
                <div class="day-number">${day}</div>
                <div class="day-name">${chosenPlannedDay.plannedDay.name}</div>
                <div class="cell-controls-row">
                    <div class="cell-button" data-day="${day}" data-index="${newIndex}"></div>
                    <div class="day-price">${Math.round(chosenPlannedDay.plannedDay.price)}р.</div>
                    <div class="cell-button" data-day="${day}" data-index="${newIndex}"></div>
                </div>
            `;

        this.updateMonthScheduleEventListeners();
    }

    loadCreatePlannedDayPage(context) {

        this.switchTemplate("createPlannedDayPage");
        this.performSideTasks(context);

        this.updateCreatePlannedDayPageEventListeners();
    }

    plusButtonEventListener(data = {}) {

        let mealsResponse = this.mealService.getCurrentUserMeals();
        data.meals = mealsResponse.hasExceptions() ? [] : mealsResponse.body;

        this.appendTemplate("newMealForm", data);
        this.updateCreatePlannedDayPageEventListeners();

    }

    updateCreatePlannedDayPageEventListeners() {


        for(const removeEventListener of this.removeEventListeners) {
            removeEventListener();
        }

        this.removeEventListeners = [];

        const isNewMealFormActive = !!document.querySelector('[data-template="newMealForm"]');

        if(isNewMealFormActive) {

            this.removeEventListeners.push(addEventListener(
                document.getElementById("close-form-button"),
                "click",
                () => {
                    this.removeTemplate("newMealForm")
                    this.updateCreatePlannedDayPageEventListeners();
                }
            ));

            this.removeEventListeners.push(addEventListener(
                document.getElementById("append-meal-button"),
                "click",
                () => this.scheduleService.appendMeal()
            ));

        } else {

            this.removeEventListeners.push(
                addEventListener(
                    document.getElementById("plus-button"),
                    "click",
                    () => this.plusButtonEventListener()
                )
            );

            this.removeEventListeners.push(
                addEventListener(
                    document.getElementById("save-button"),
                    "click",
                    () => this.scheduleService.savePlannedDay()
                )
            );

            document.querySelectorAll(".delete-button").forEach(
                (element) => {
                    this.removeEventListeners.push(
                        addEventListener(
                            element,
                            "click",
                            () => this.scheduleService.removePlannedDayMeal(element)
                        )
                    )
                }
            );
        }
    }

    loadPlannedDaysListPage(context) {

        const currentUserPlannedDaysResponse = this.scheduleService.getCurrentUserPlannedDays();

        const data = {};

        if(!currentUserPlannedDaysResponse.hasExceptions()) {
            data.plannedDays = currentUserPlannedDaysResponse.body;
        }

        this.switchTemplate("plannedDaysListPage", data);
        this.performSideTasks(context);
    }

    loadPlannedDayPage(context) {

        const plannedDayId = context.url.split("/")[2];

        const plannedDayResponse = this.scheduleService.getPlannedDayById(plannedDayId);

        if(!plannedDayResponse.hasExceptions()) {

            for(const plannedDayMeal of plannedDayResponse.body.plannedDayMeals) {
                plannedDayMeal.time.hours = pad(plannedDayMeal.time.hours, 2);
                plannedDayMeal.time.minutes = pad(plannedDayMeal.time.minutes, 2);

                const mealResponse = this.mealService.getMealById(plannedDayMeal.mealId);

                if(!mealResponse.hasExceptions()) {
                    plannedDayMeal.meal = mealResponse.body;
                }
            }

            this.switchTemplate("plannedDayPage", plannedDayResponse.body);

            this.performSideTasks(context);

            document.getElementById("delete-button").addEventListener(
                "click",
                () => this.scheduleService.deletePlannedDay(plannedDayResponse.body.id)
            );
        }
    }
}