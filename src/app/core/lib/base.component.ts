import { ActivatedRoute } from "@angular/router";
import { OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { environment } from 'src/environments/environment';

declare var require: any;
declare var jquery:any;
declare var $:any;

export class BaseComponent implements OnInit {

    successMessage : string = '';
    errorMessage   : string = '';
    disableActions : boolean = false;

    constructor(private route : ActivatedRoute) { }

    ngOnInit() : void {
        this.initJqueryComponents();
    }

    handleError(error : HttpErrorResponse) {
        if (error.error) {
            this.successMessage = '';
            this.errorMessage   = '';
            var instance = this;
            BaseComponent.convertXmlToString(error.error, function(err, result) {
                try {
                    console.log('vendavo-soap-response', result);
                    instance.errorMessage = result['soapenv:Envelope']['soapenv:Body'][0]['soapenv:Fault'][0]['faultstring'][0];
                }
                catch {
                    instance.errorMessage = error.message;
                }
                setTimeout(function() {
                    instance.successMessage = '';
                    instance.errorMessage   = '';
                }, 10000);
            });
            this.disableActions = false;
        }
      }

    initJqueryComponents() : void {
        $('.datetimepicker').datetimepicker({ format : this.getDefaultDTPickerDateFormat(), showClear : true, showClose : true });
        $('.datetimepicker').keydown(function(event) { return false; });

        var instance = this;
        $('.datetimepicker').on('dp.change', function(event) {
            instance['on'+event.currentTarget.id+'Change'](this.value);
        });
    }

    getDefaultDTPickerDateFormat() : string {
        return 'MM/DD/YYYY';
    }

    getXmlReportName() : string {
        return this.route.snapshot.paramMap.get('reportId');
    }

    getQueryStringParamValue(query : string = 'id') : string {
        var value = '';
        if (this.route.snapshot) {
            value = this.route.snapshot.paramMap.get(query);
            
            if (!value || value == '') {
                if (this.route.snapshot.queryParams)
                    value = this.route.snapshot.queryParams[query];
            }
        }
        return value;
    }

    showPanels() : boolean {
        var show  = true;
        var value = this.getQueryStringParamValue('hidePanels');
        if (value)
            show = value.trim() == '' || value.trim().toLowerCase() != 'true';
        if (!show) {
            $('#content').css('margin-left', '0%');
        }
        return show;
    }

    getServiceBaseUrl() : string {
        return environment.serviceBaseUrl;
    }

    getMatchingObject(data : {}, colName : string, value : string) : {} {
        var result = {};
        if (data && data['data']) {
            for (let row of data['data']) {
                if (row[colName] && row[colName] == value) {
                    result = row;
                    break;
                }
            }
        }
        return result;
    }

    initSelect2(formData : {}, sourceData : object, valProperty : string,  textProperty : string, isMultiple : boolean) : void {
        if (sourceData) {
            var selects = sourceData['data'];
            $('#'+textProperty).select2({
                multiple: isMultiple,
                query: function (query){
                    var data = {results: []};
                        $.each(selects, function(){
                        if(query.term.length == 0 || this.TEXT.toUpperCase().indexOf(query.term.toUpperCase()) >= 0 ){
                            data.results.push({id: this.VALUE, text: this.TEXT });
                        }
                    });
                    query.callback(data);
                }
            });
            $('#'+textProperty).val(formData['data'][0][valProperty]);
            $('div#s2id_'+textProperty+' span.select2-chosen').text(formData['data'][0][textProperty]);
            $('#'+textProperty).select2('open');
            $('#'+textProperty).on("change", function(e) {
                formData['data'][0][valProperty ] = e.added.id;
                formData['data'][0][textProperty] = e.added.text;
                console.log(formData);
            });
        }
    }

    isFieldValid(form : NgForm, fieldName : string, type : number) : boolean {
        if (form.controls[fieldName]) {
            if (type == 1 && form.controls[fieldName].errors && form.controls[fieldName].errors.required)
                return false;
            if (type == 2 && form.controls[fieldName].errors && form.controls[fieldName].errors.pattern)
                return false;
        }
        return true;
    }

    static convertXmlToString(xml : string, callback : object) {
        //var parseString = require('xml2js').parseString;
        //parseString(xml, callback);
    }

    isPageEditable(status : String) : boolean {
        return status.toLowerCase() == 'draft';
    }
}