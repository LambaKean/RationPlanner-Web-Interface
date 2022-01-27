export default class MeasurementUniService {

    apiConnector = null;

    constructor(apiConnector) {
        this.apiConnector = apiConnector;
    }

    getUnits() {
        return this.apiConnector.sendRequest("get", "/measurementUnit");
    }

}