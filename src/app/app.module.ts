
import { NgModule} from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MatSidenavModule, MatProgressBarModule, MatToolbarModule, MatTabsModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatIconModule, MatFormFieldModule, MatSelectModule, MatMenuModule, MatTableModule, MatTooltipModule, MatStepperModule, MatCheckboxModule, MatCardModule, MatAutocompleteModule, MatDialogModule, MatInputModule, MatExpansionModule, MatPaginatorModule, MatProgressSpinnerModule, MatTreeModule} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReportComponent } from './components/report/report.component';
import { XmlReportComponent } from './core/xml-report';
import { Broadcaster } from './core/lib/broadcast.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpService } from './core/lib/http';
import { HttpClientModule } from '@angular/common/http';
import { DataLoadingSpinnerComponent } from './core/data-loading-spinner/data-loading-spinner.component';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';

@NgModule({
  declarations: [
    AppComponent,
    ReportComponent,
    XmlReportComponent,
    DataLoadingSpinnerComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    MatSidenavModule,
    AppRoutingModule,
    HttpClientModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTabsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatMenuModule,
    MatTableModule,
    MatTooltipModule,
    MatStepperModule,
    MatCheckboxModule,
    MatCardModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatExpansionModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTreeModule,
    ReactiveFormsModule,
    AngularSvgIconModule
  ],
  providers: [HttpService, Broadcaster],
  bootstrap: [AppComponent]
})
export class AppModule { }

