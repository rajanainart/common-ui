export enum FieldType {
    INTEGER,
    NUMERIC,
    DATE,
    TEXT,
    SELECT
}

export interface ReportFilter {
    isTypeSupported(type : string) : boolean;
    getOperator    () : string;
    getOperatorName() : string;
}

export class ContainsReportFilter implements ReportFilter {
    isTypeSupported(type : string) : boolean {
        return type == FieldType[FieldType.TEXT];
    }

    getOperator    () : string { return "LIKE"    ; }
    getOperatorName() : string { return "contains"; }
}

export class NotContainsReportFilter implements ReportFilter {
    isTypeSupported(type : string) : boolean {
        return type == FieldType[FieldType.TEXT];
    }

    getOperator    () : string { return "NOT LIKE"    ; }
    getOperatorName() : string { return "not contains"; }
}

export class EqualReportFilter implements ReportFilter {
    isTypeSupported(type : string) : boolean {
        return type != FieldType[FieldType.SELECT]
    }

    getOperator    () : string { return "="; }
    getOperatorName() : string { return "equal"; }
}

export class NotEqualReportFilter implements ReportFilter {
    isTypeSupported(type : string) : boolean {
        return type != FieldType[FieldType.SELECT]
    }

    getOperator    () : string { return "!="; }
    getOperatorName() : string { return "not equal"; }
}

export class InReportFilter implements ReportFilter {
    isTypeSupported(type : string) : boolean {
        return type == FieldType[FieldType.SELECT];
    }

    getOperator    () : string { return "IN"; }
    getOperatorName() : string { return "in"; }
}

export class NotInReportFilter implements ReportFilter {
    isTypeSupported(type : string) : boolean {
        return type == FieldType[FieldType.SELECT];
    }

    getOperator    () : string { return "NOT IN"; }
    getOperatorName() : string { return "not in"; }
}

export class GreaterThanReportFilter implements ReportFilter {
    isTypeSupported(type : string) : boolean {
        return type == FieldType[FieldType.INTEGER] || type == FieldType[FieldType.NUMERIC] || type == FieldType[FieldType.DATE];
    }

    getOperator    () : string { return ">"; }
    getOperatorName() : string { return "greater than"; }
}

export class GreaterThanEqualToReportFilter implements ReportFilter {
    isTypeSupported(type : string) : boolean {
        return type == FieldType[FieldType.INTEGER] || type == FieldType[FieldType.NUMERIC] || type == FieldType[FieldType.DATE];
    }

    getOperator    () : string { return ">="; }
    getOperatorName() : string { return "greater than or equal to"; }
}

export class LesserThanReportFilter implements ReportFilter {
    isTypeSupported(type : string) : boolean {
        return type == FieldType[FieldType.INTEGER] || type == FieldType[FieldType.NUMERIC] || type == FieldType[FieldType.DATE];
    }

    getOperator    () : string { return "<"; }
    getOperatorName() : string { return "lesser than"; }
}

export class LesserThanEqualToReportFilter implements ReportFilter {
    isTypeSupported(type : string) : boolean {
        return type == FieldType[FieldType.INTEGER] || type == FieldType[FieldType.NUMERIC] || type == FieldType[FieldType.DATE];
    }

    getOperator    () : string { return "<="; }
    getOperatorName() : string { return "lesser than or equal to"; }
}

export class BetweenReportFilter implements ReportFilter {
    isTypeSupported(type : string) : boolean {
        return type == FieldType[FieldType.INTEGER] || type == FieldType[FieldType.NUMERIC] || type == FieldType[FieldType.DATE];
    }

    getOperator    () : string { return "BETWEEN"; }
    getOperatorName() : string { return "between"; }
}

export class NotBetweenReportFilter implements ReportFilter {
    isTypeSupported(type : string) : boolean {
        return type == FieldType[FieldType.INTEGER] || type == FieldType[FieldType.NUMERIC] || type == FieldType[FieldType.DATE];
    }

    getOperator    () : string { return "NOT BETWEEN"; }
    getOperatorName() : string { return "not between"; }
}

export class NullReportFilter implements ReportFilter {
    isTypeSupported(type : string) : boolean {
        return true;
    }

    getOperator    () : string { return "NULL"; }
    getOperatorName() : string { return "is null"; }
}

export class NotNullReportFilter implements ReportFilter {
    isTypeSupported(type : string) : boolean {
        return true;
    }

    getOperator    () : string { return "NOT NULL"; }
    getOperatorName() : string { return "is not null"; }
}