import { ReportFilter, ContainsReportFilter, NotContainsReportFilter, EqualReportFilter, NotEqualReportFilter, 
    InReportFilter, NotInReportFilter, GreaterThanReportFilter, GreaterThanEqualToReportFilter, LesserThanReportFilter, 
    LesserThanEqualToReportFilter, BetweenReportFilter, NotBetweenReportFilter, NullReportFilter, NotNullReportFilter, FieldType } from "./xml-report.filter";

export class ReportFieldManager {
    private static filters : ReportFilter[] = [];

    private xmlFields = [];

    private static initialize() {
        ReportFieldManager.filters.push(new ContainsReportFilter());
        ReportFieldManager.filters.push(new NotContainsReportFilter());
        ReportFieldManager.filters.push(new EqualReportFilter());
        ReportFieldManager.filters.push(new NotEqualReportFilter());
        ReportFieldManager.filters.push(new InReportFilter());
        ReportFieldManager.filters.push(new NotInReportFilter());
        ReportFieldManager.filters.push(new GreaterThanReportFilter());
        ReportFieldManager.filters.push(new GreaterThanEqualToReportFilter());
        ReportFieldManager.filters.push(new LesserThanReportFilter());
        ReportFieldManager.filters.push(new LesserThanEqualToReportFilter());
        ReportFieldManager.filters.push(new BetweenReportFilter());
        ReportFieldManager.filters.push(new NotBetweenReportFilter());
        ReportFieldManager.filters.push(new NullReportFilter());
        ReportFieldManager.filters.push(new NotNullReportFilter());
    }

    constructor() {
        if (ReportFieldManager.filters.length == 0)
            ReportFieldManager.initialize();
    }

    updateField(id : string, value : string) {
        var splits = id.split("___");
        var index  = this.getFieldIndex(splits[0]);
        if (index != -1) {
            if (splits[1] == '1')
                this.xmlFields[index]['value1'] = value;
            if (splits[1] == '2')
                this.xmlFields[index]['value2'] = value;
        }
    }

    deleteField(id : string) {
        var index = this.getFieldIndex(id);
        if (index != -1)
            this.xmlFields.splice(index, 1);
    }

    getFieldIndex(id : string) {
        var foundAt = -1;
        for (var idx=0; idx<this.xmlFields.length; idx++) {
            if (this.xmlFields[idx]['fieldId'] == id) {
                foundAt = idx;
                break;
            }
        }
        return foundAt;
    }

    buildXmlField(id : string, name : string, type : string) : XmlReportField {
        console.log('xml-filter-fields',this.xmlFields);
        var foundAt = this.getFieldIndex(id);
        if (foundAt == -1) {
            let field = new XmlReportField(id, name, type);
            this.xmlFields.push(field);
            return field;
        }
    }

    getAllXmlFields() { return this.xmlFields; }

    getAllXmlFieldsWithFilter() { 
        var result = [];
        if (this.xmlFields) {
            for (let f of this.xmlFields) {
                if (f['value1'] != '')
                    result.push(f);
            }
        }
        return result; 
    }

    static getAllFilters() : ReportFilter[] { return this.filters; }
}

export class XmlReportField {
    fieldId  : string;
    fieldName: string;
    fieldType: string;
    operator : string = "=";
    value1   : string = "";
    value2   : string = "";

    private filters : ReportFilter[] = [];

    constructor(fieldId : string, fieldName : string, fieldType : string) {
        this.fieldId   = fieldId;
        this.fieldName = fieldName;
        this.fieldType = fieldType;
        if (fieldType == FieldType[FieldType.SELECT])
            this.operator = "IN";
        for (let f of ReportFieldManager.getAllFilters()) {
            if (f.isTypeSupported(fieldType))
                this.filters.push(f);
        }
    }

    getReportFilters() : ReportFilter[] { return this.filters; }
}