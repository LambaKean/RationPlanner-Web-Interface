export default class MealService {

    apiConnector = null;
    mealController = null;
    productService = null;
    measurementUnitService = null;
    exceptionsHandler = null;

    newMealIngredients = [];

    constructor(apiConnector, mealController, productService, measurementUnitService) {
        this.apiConnector = apiConnector;
        this.mealController = mealController;
        this.productService = productService;
        this.measurementUnitService = measurementUnitService;
    }

    editIngredient(index) {

        const errorsContainer = document.getElementById("new-ingredient-errors");
        errorsContainer.innerHTML = "";

        const name = document.getElementById("ingredient-name").value;
        if(!name || name.length < 2 || name.length > 50) {
            const errorDiv = document.createElement("div");
            errorDiv.classList.add("error");
            errorDiv.innerText = "Название ингредиента должно иметь длину от 2 до 50 символов";
            errorsContainer.appendChild(errorDiv);
            return;
        }

        const measurementUnitsSelect = document.getElementById("ingredient-measurement-units");

        const measurementUnitId = measurementUnitsSelect.value;
        const measurementUnitName = measurementUnitsSelect.options[measurementUnitsSelect.selectedIndex].text;

        let quantity = document.getElementById("ingredient-quantity").value;
        if(quantity === "") {
            const errorDiv = document.createElement("div");
            errorDiv.classList.add("error");
            errorDiv.innerText = "Вы должны указать количество ингредиента";
            errorsContainer.appendChild(errorDiv);
            return;
        } else {
            quantity = parseInt(quantity);
        }

        let product;

        let productId = document.getElementById("ingredient-products").value;

        if(productId === "") {
            product = null;
        } else {
            product = {id: productId};
        }

        this.newMealIngredients[index] = {
            name: name,
            product: product,
            productQuantity: {
                amount: quantity,
                measurementUnit: {
                    id: measurementUnitId,
                    name: measurementUnitName
                }
            }
        };

        this.renderIngredientsCards();

        this.mealController.removeTemplate("newIngredientForm");

        this.mealController.updateCreateMealPageEventListeners();
    }

    appendIngredient() {

        const form = document.querySelector('[data-template="newIngredientForm"]');

        if(!form) {
            return;
        }

        if(form.dataset.productIndex) {
            this.editIngredient(parseInt(form.dataset.productIndex));
            return;
        }

        const errorsContainer = document.getElementById("new-ingredient-errors");
        errorsContainer.innerHTML = "";

        const name = document.getElementById("ingredient-name").value;
        if(!name || name.length < 2 || name.length > 50) {
            const errorDiv = document.createElement("div");
            errorDiv.classList.add("error");
            errorDiv.innerText = "Название ингредиента должно иметь длину от 2 до 50 символов";
            errorsContainer.appendChild(errorDiv);
            return;
        }

        const measurementUnitsSelect = document.getElementById("ingredient-measurement-units");

        const measurementUnitId = measurementUnitsSelect.value;
        const measurementUnitName = measurementUnitsSelect.options[measurementUnitsSelect.selectedIndex].text;

        let quantity = document.getElementById("ingredient-quantity").value;
        if(quantity === "") {
            const errorDiv = document.createElement("div");
            errorDiv.classList.add("error");
            errorDiv.innerText = "Вы должны указать количество ингредиента";
            errorsContainer.appendChild(errorDiv);
            return;
        } else {
            quantity = parseInt(quantity);
        }

        let product;

        let productId = document.getElementById("ingredient-products").value;

        if(productId === "") {
            product = null;
        } else {
            product = {id: productId};
        }

        const ingredientDto = {
            name: name,
            product: product,
            productQuantity: {
                amount: quantity,
                measurementUnit: {
                    id: measurementUnitId,
                    name: measurementUnitName
                }
            }
        }

        this.newMealIngredients.push(ingredientDto);

        this.renderIngredientsCards();

        this.mealController.removeTemplate("newIngredientForm");

        this.mealController.updateCreateMealPageEventListeners();
    }

    renderIngredientsCards() {

        const container = document.getElementById("ingredients-container");
        container.innerHTML = "";

        for (const ingredient of this.newMealIngredients) {

            let ingredientCardClass;

            if(ingredient.product) {
                ingredientCardClass = "has-product";
            } else {
                ingredientCardClass = "";
            }

            container.innerHTML +=
                `
                <div class="ingredient-card ${ingredientCardClass}" data-index="${this.newMealIngredients.indexOf(ingredient)}">
                    <div class="ingredient-name">${ingredient.name}</div>
                    <div class="ingredient-quantity">${ingredient.productQuantity.amount} ${ingredient.productQuantity.measurementUnit.name}</div>
                    <div class="ingredient-delete-button"><img src="/delete.png" alt="Delete"></div>
                </div>
                `;
        }

    }

    removeIngredient(index) {
        this.newMealIngredients.splice(index, 1);
        this.renderIngredientsCards();
    }

    createMeal() {

        const name = document.getElementById("name").value;
        const description = document.getElementById("description").value;
        const hours = document.getElementById("hours").value;
        const minutes = document.getElementById("minutes").value;
        const ingredients = this.newMealIngredients;
        const recipe = document.getElementById("recipe").value;

        const mealDto = {
            name: name,
            description: description,
            cookingDuration: {
                hours: parseInt(hours),
                minutes: parseInt(minutes)
            },
            recipe: recipe,
            ingredients: ingredients
        }

        const createMealResponse = this.apiConnector.sendRequest(
            "post",
            "/meal",
            JSON.stringify(mealDto)
        );

        if(createMealResponse.hasExceptions()) {
            this.exceptionsHandler.handleCreateMealExceptions(createMealResponse);
        }

        return createMealResponse;
    }

    getCurrentUserMeals() {

        const response = this.apiConnector.sendRequest(
            "get",
            "/meal"
        );

        if(response.hasExceptions()) {
            if(response.hasExceptionWithCode("userNotLoggedIn")) {
                this.exceptionsHandler.handleUserNotLoggedInException(response);
            }
        }

        return response;
    }

    getMealById(id) {

        const response = this.apiConnector.sendRequest(
            "get",
            "/meal/" + id
        );

        if(response.hasExceptions()) {
            if(response.hasExceptionWithCode("entityNotFound")) {

                this.exceptionsHandler.handleEntityNotFoundException(
                    response,
                    {message: "Запрошенное вами блюдо не было найдено"}
                );

            } else if (response.hasExceptionWithCode("userNotLoggedIn")) {

                this.exceptionsHandler.handleUserNotLoggedInException(response);

            } else if(response.hasExceptionWithCode("accessDenied")) {

                this.exceptionsHandler.handleAccessDeniedException(response);

            }
        }

        return response;
    }

    deleteMeal(id) {
        const response = this.apiConnector.sendRequest(
            "delete",
            "/meal/" + id
        );

        if(response.hasExceptions()) {

            if(response.hasExceptionWithCode("userNotLiggedIn")) {
                this.exceptionsHandler.handleUserNotLoggedInException(response);
            }

            this.exceptionsHandler.handleDeleteMealExceptions(response);
        }
    }
}