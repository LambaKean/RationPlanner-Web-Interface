export default class ProductService {

    exceptionsHandler = null;
    apiConnector = null;

    constructor(exceptionsHandler, apiConnector) {
        this.exceptionsHandler = exceptionsHandler;
        this.apiConnector = apiConnector;
    }

    getProductById(id) {

        const response = this.apiConnector.sendRequest(
            "get",
            "/product/" + id
        );

        if(response.hasExceptions()) {
            if(response.hasExceptionWithCode("entityNotFound")) {

                this.exceptionsHandler.handleEntityNotFoundException(
                    response,
                    {message: "Запрошенный вами продукт не был найден"}
                );

            } else if (response.hasExceptionWithCode("userNotLoggedIn")) {

                this.exceptionsHandler.handleUserNotLoggedInException(response);

            } else if(response.hasExceptionWithCode("accessDenied")) {

                this.exceptionsHandler.handleAccessDeniedException(response);

            }
        }

        return response;
    }

    getCurrentUserProducts() {

        const response = this.apiConnector.sendRequest(
            "get",
            "/product"
        );

        if(response.hasExceptions()) {
            if(response.hasExceptionWithCode("userNotLoggedIn")) {
                this.exceptionsHandler.handleUserNotLoggedInException(response);
            }
        }

        return response;
    }

    createProduct() {

        const name = document.getElementById("name").value;
        const producer = document.getElementById("producer").value !== "" ?
            document.getElementById("producer").value : null;
        const quantityAmount = document.getElementById("quantity-amount").value;
        const measurementUnitId = document.getElementById("quantity-name").value;
        const price = document.getElementById("price").value;

        const productDto = {
            name: name,
            producer: producer,
            quantity: {
                amount: quantityAmount,
                measurementUnit: {
                    id: measurementUnitId
                }
            },
            price: price
        };

        const createProductResponse = this.apiConnector.sendRequest(
            "post",
            "/product",
            JSON.stringify(productDto)
        );

        console.log(createProductResponse)

        if(createProductResponse.hasExceptions()) {
            this.exceptionsHandler.handleCreateNewProductExceptions(createProductResponse);
        }

        return createProductResponse;
    }

    deleteProduct(productId) {

        const response = this.apiConnector.sendRequest(
            "delete",
            "/product/" + productId
        );

        if(response.hasExceptions()) {
            this.exceptionsHandler.handleDeleteProductExceptions(response);
        }
    }
}