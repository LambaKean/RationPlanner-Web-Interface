import Controller from "./Controller.mjs";
import {addEventListener} from "../functions.mjs";

export default class MealController extends Controller {

    removeEventListeners = [];

    mealService = null;
    measurementUnitService = null;
    productService = null;

    constructor(userService, view, eventListenersManager, mealService, measurementUnitService, productService, router) {
        super(userService, view, eventListenersManager, router);
        this.mealService = mealService;
        this.productService = productService;
        this.measurementUnitService = measurementUnitService;
    }

    loadCreateMealPage(context) {

        if(!this.userService.isUserLoggedIn()) {
            this.switchTemplate(
                "userNotLoggedIn",
                {message: "Вы не можете добавить блюдо, потому что не вошли в свой аккаунт."}
            );

            this.performSideTasks(context);
            return;
        }

        this.switchTemplate("createMealPage");

        this.updateCreateMealPageEventListeners();

        this.performSideTasks(context);
    }

    updateCreateMealPageEventListeners() {

        for(const removeEventListener of this.removeEventListeners) {
            removeEventListener();
        }

        this.removeEventListeners = [];

        const isNewIngredientFormActive = !!document.querySelector('[data-template="newIngredientForm"]');

        if(isNewIngredientFormActive) {

            this.removeEventListeners.push(addEventListener(
                document.getElementById("close-form-button"),
                "click",
                () => {
                    this.removeTemplate("newIngredientForm")
                    this.updateCreateMealPageEventListeners();
                }
            ));

            this.removeEventListeners.push(addEventListener(
                document.getElementById("append-ingredient-button"),
                "click",
                () => this.mealService.appendIngredient()
            ));

            this.removeEventListeners.push(addEventListener(
                document.getElementById("ingredient-products"),
                "change",
                () => this.onProductSelect()
            ));

            this.removeEventListeners.push(addEventListener(
                document.getElementById("ingredient-measurement-units"),
                "change",
                () => this.onMeasurementUnitSelect()
            ));

        } else {

            this.removeEventListeners.push(addEventListener(
                document.getElementById("plus-button"),
                "click",
                () => this.loadNewIngredientForm()
            ));

            document.querySelectorAll(".ingredient-card .ingredient-delete-button").forEach(
                (element) => {
                    this.removeEventListeners.push(
                        addEventListener(
                            element,
                            "click",
                            (event) => {

                                event.stopPropagation();

                                const index = parseInt(element.dataset.index);

                                this.mealService.removeIngredient(index);

                                this.updateCreateMealPageEventListeners();
                            }
                        )
                    );
                }
            );

            document.querySelectorAll(".ingredient-card").forEach(
                (element) => {
                    this.removeEventListeners.push(
                        addEventListener(
                            element,
                            "click",
                            () => {

                                const index = parseInt(element.dataset.index);

                                this.loadNewIngredientForm({
                                    index: index,
                                    ingredient: this.mealService.newMealIngredients[index]
                                });

                                this.updateCreateMealPageEventListeners();
                            }
                        )
                    );
                }
            );

            this.removeEventListeners.push(
                addEventListener(
                    document.getElementById("save-button"),
                    "click",
                    () => {
                        const response = this.mealService.createMeal();

                        if(!response.hasExceptions()) {
                            this.router.handleRequest("/meal/" + response.body.id);
                        }
                    }
                )
            );
        }
    }

    onProductSelect() {

        const measurementUnitsSelect = document.getElementById("ingredient-measurement-units");
        const measurementUnitId = measurementUnitsSelect.value;

        const productsSelect = document.getElementById("ingredient-products");
        const selectedProductOption = productsSelect.options[productsSelect.selectedIndex];

        if(!selectedProductOption.dataset.measurementUnitId) {
            return;
        }

        if(selectedProductOption.dataset.measurementUnitId !== measurementUnitId) {
            measurementUnitsSelect.value = selectedProductOption.dataset.measurementUnitId;
        }
    }

    onMeasurementUnitSelect() {
        const measurementUnitsSelect = document.getElementById("ingredient-measurement-units");
        const measurementUnitId = measurementUnitsSelect.value;

        const productsSelect = document.getElementById("ingredient-products");
        const selectedProductOption = productsSelect.options[productsSelect.selectedIndex];

        if(measurementUnitId !== selectedProductOption.dataset.measurementUnitId) {
            productsSelect.value = "";
        }
    }

    loadNewIngredientForm(data = {}) {

        let measurementUnitsResponse = this.measurementUnitService.getUnits();
        let measurementUnits = measurementUnitsResponse.hasExceptions() ? [] : measurementUnitsResponse.body;

        let productsResponse = this.productService.getCurrentUserProducts();
        let products = productsResponse.hasExceptions() ? [] : productsResponse.body;

        data.measurementUnits = measurementUnits;
        data.products = products;

        this.appendTemplate("newIngredientForm", data);

        this.updateCreateMealPageEventListeners();
    }

    loadMealsListPage(context) {
        if(!this.userService.isUserLoggedIn()) {
            this.switchTemplate(
                "userNotLoggedIn",
                {
                    message: "Вы не можете просматривать список своих блюд, потому что не вошли в свой аккаунт."
                }
            );

            this.performSideTasks(context);
            return;
        }

        const getCurrentUserMealsResponse = this.mealService.getCurrentUserMeals();

        this.switchTemplate("mealsListPage", {meals: getCurrentUserMealsResponse.body});

        this.performSideTasks(context);

        document.querySelectorAll(".meal-card").forEach(
            (element) => {
                element.addEventListener("click", (e) => {
                    this.router.handleRequest("/meal/" + e.currentTarget.dataset.mealId);
                });
            }
        );
    }

    loadMealPage(context) {

        const mealId = context.url.split("/")[2];

        const mealResponse = this.mealService.getMealById(mealId);

        if(!mealResponse.hasExceptions()) {
            this.switchTemplate("mealPage", mealResponse.body);

            this.performSideTasks(context);

            document.getElementById("delete-button").addEventListener(
                "click",
                () => this.deleteMeal(mealResponse.body.id)
            );
        }
    }

    deleteMeal(id) {

        const response = this.mealService.deleteMeal(id);

        if(!response || !response.hasExceptions()) {
            this.router.handleRequest("/meal");
        }
    }
}