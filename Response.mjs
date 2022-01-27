export default class Response {

    status = null;
    body = null;

    constructor(status, data = {}) {
        this.status = status;
        this.body = data;
    }

    hasExceptions() {
        return this.body && this.body["exceptions"] && this.body["exceptions"].length > 0;
    }

    hasExceptionWithCode(searchedCode) {

        if(!this.hasExceptions()) {
            return false;
        }

        for(const { code } of this.body["exceptions"]) {

            if(searchedCode === code) {
                return true;
            }
        }

        return false;
    }

    getExceptionByCode(searchedCode) {

        if(!this.hasExceptions()) {
            return null;
        }

        for(const exception of this.body["exceptions"]) {

            if(searchedCode === exception.code) {
                return exception;
            }
        }

        return null;
    }
}