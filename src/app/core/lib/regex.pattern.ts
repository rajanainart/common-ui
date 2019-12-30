export class RegexPattern {
    static INTEGER_REGEX: string = '^[0-9]+$';
    static NUMERIC_REGEX: string = '^[0-9]+[\.]*[0-9]*$';
    static DATE_REGEX: string = '^(0[1-9]+|1[0-2]+)\/(0[1-9]+|1\d|2\d|3[01]+)\/(19|20)\d{2}$';
    static URL_PARAM_REGEX: string = '@[a-zA-Z0-9\_]+@';

    static getRegExTokens(expression : string, regex : string) : string[] {
        const instance = new RegExp(regex, 'g');
        return expression.match(instance);
    }

    static getParsedExpression(expression : string, input : {}, regex : string) : string {
        const tokens = RegexPattern.getRegExTokens(expression, regex);
        let result = expression;
        for (let idx=0; idx<tokens.length; idx++) {
            const key = tokens[idx].replace(/@/g, '');
            const val = input[key] ? input[key] : '';
            result  = result.replace(tokens[idx], val);
        }
        return result;
    }

    static isValidValue(regex : string, value : string) {
        var instance = new RegExp(regex, 'g');
        return instance.test(value);
    }
}