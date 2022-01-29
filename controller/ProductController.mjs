import Controller from "./Controller.mjs";
import {API_DOMAIN, API_VERSION, PROTOCOL} from "../config.mjs";

export default class ProductController extends Controller {

    productService = null;
    measurementUnitService = null;

    constructor(userService, view, eventListenersManager, productService, measurementUnitService, router) {
        super(userService, view, eventListenersManager, router);
        this.productService = productService;
        this.measurementUnitService = measurementUnitService;
    }

    loadCreateProductPage(context) {

        if(!this.userService.isUserLoggedIn()) {
            this.switchTemplate(
                "userNotLoggedIn",
                {message: "Вы не можете добавить продукт, потому что не вошли в свой аккаунт."}
            );

            this.performSideTasks(context);
            return;
        }

        const measurementUnitsResponse = this.measurementUnitService.getUnits();

        if(measurementUnitsResponse.hasExceptions()) {
            console.error(measurementUnitsResponse);
        } else {
            this.switchTemplate(
                "createProductPage",
                {measurementUnits: measurementUnitsResponse.body}
            );
        }

        this.performSideTasks(context);

        document.getElementById("saveButton").addEventListener(
            "click",
            () => this.createProduct()
        );
    }

    createProduct() {

        const createProductResponse = this.productService.createProduct();

        if(createProductResponse && !createProductResponse.hasExceptions()) {
            this.router.handleRequest("/product/" + createProductResponse.body.id);
        }
    }

    loadProductPage(context) {

        const productId = context.url.split("/")[2];

        const productResponse = this.productService.getProductById(productId);

        if(!productResponse.hasExceptions()) {

            if(productResponse.body.photo) {
                productResponse.body.photo.rootUrl = PROTOCOL + "://" + API_DOMAIN + "/api/" + API_VERSION + "/photo/";
            }

            this.switchTemplate("productPage", productResponse.body);

            this.performSideTasks(context);

            document.getElementById("delete-button").addEventListener(
                "click",
                () => this.deleteProduct(productResponse.body.id)
            );
        }
    }

    deleteProduct(productId) {

        const response = this.productService.deleteProduct(productId);

        if(!response || !response.hasExceptions()) {
            this.router.handleRequest("/product");
        }
    }

    loadProductsListPage(context) {

        const response = this.productService.getCurrentUserProducts();

        if(!response.hasExceptions()) {
            this.switchTemplate("productsListPage", {products: response.body});
            this.performSideTasks(context)
        }
    }
}