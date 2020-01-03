import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DialogComponent } from '../dialog/dialog.component';

@Injectable({
    providedIn: 'root'
})
export class DialogService {

    constructor(private dialog: MatDialog) { }

    showError(errorRes: any, showTryLater: boolean = true) {
        const error = {
            message: errorRes.message,
            details: errorRes.details,
            type: 'error',
            showTryLater: showTryLater
        };
        return this.openDialog(error, '400px');
    }

    showSuccess(message: any) {
        const success = {
            message: message,
            type: 'success'
        };
        return this.openDialog(success, '400px');
    }

    showWarn(message: string) {
        const warn = {
            message: message,
            type: 'warn'
        };
        return this.openDialog(warn, '400px');
    }

    confirmYesNo(message: string, disableClose: boolean = false) {
        const confirm = {
            type: 'confirmYesNo',
            message: message
        };
        return this.openDialog(confirm, '400px', disableClose);
    }

    openDialog(data: any, width: string, disableClose: boolean = false ) {
        return this.dialog.open(DialogComponent, {
            width: width,
            data: data,
            disableClose: disableClose
        });
    }
}
