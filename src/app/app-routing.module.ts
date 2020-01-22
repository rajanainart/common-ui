import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportComponent } from './components/report/report.component';
import { ReportGroupComponent } from './components/report-group/report-group.component';

const routes: Routes = [
  { path: 'xmlreport/:reportId', component: ReportComponent },
  { path: 'xmlreportgroup/:reportId', component: ReportGroupComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
