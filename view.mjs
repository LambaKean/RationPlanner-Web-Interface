export default class View {

    render(templateName, data = {}) {

        const compiledTemplate = Handlebars.getTemplate(templateName);
        return compiledTemplate(data);
    }

}