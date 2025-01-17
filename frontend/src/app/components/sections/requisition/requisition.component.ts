import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { confirmDialog, errorMessage, successDialog } from 'src/app/components/resources/alert';
import { Privileges } from 'src/app/interfaces/privileges/privileges';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';
import { RequisitionService } from 'src/app/services/requisition/requisition.service';
import { ServiceRequestService } from 'src/app/services/serviceRequest/service-request.service';
import { MaintenanceDialogComponent } from '../dialogs/maintenance-dialog/maintenance-dialog.component';
import { RequestDialogComponent } from '../dialogs/request-dialog/request-dialog.component';
import { RequisitionDialogComponent } from '../dialogs/requisition-dialog/requisition-dialog.component';

@Component({
  selector: 'app-requisition',
  templateUrl: './requisition.component.html',
  styleUrls: ['./requisition.component.css']
})
export class RequisitionComponent implements OnInit {
  privileges: Privileges = {see: null,
    create: null,
    cancel: null,
    edit: null,
    authorize: null,
    reject: null,
    finish: null}
  user: any
  displayedColumns= ['dependency','elaboration_date','check_in_date','justification', 'responsible', 'contact','status', 'accept', 'cancel', 'edit'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  constructor(private dialogRef: MatDialog, private requisitionService: RequisitionService,private authService: AuthenticationService) { }

  ngOnInit() {
    this.loadRequests();
    this.getData()
  }

  filter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

   openDialog(action: boolean, id?){   
    const dialogRef = this.dialogRef.open(RequisitionDialogComponent,{
      width: '840px',
      data: {id, action},
    })

    dialogRef.afterClosed().subscribe(result => {
      this.loadRequests()
    });
  }
  
  loadRequests() {  
    this.requisitionService.index()
        .subscribe(  
            x => {  
              console.log(x.data)
      this.dataSource = new MatTableDataSource();  
      this.dataSource.data = x.data;  
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;

    },  
    error => {  
      console.log('Error' + error);  
    });  
  }

  cancelRequest(id){
    confirmDialog('¿Estás seguro que deseas cancelar esta requisición?', 'Cancelar', 'Aceptar').then((result) => {
      if (result.value) {
        this.requisitionService.cancel(id).subscribe( res => {
          if (res.status){
            successDialog(res.message).then(() => {
              this.loadRequests()
            })
          } else{
            errorMessage(res.message)
          }
        }, error => {
          errorMessage(error)
        })
      }
    })
  }

  acceptRequest(id){
    confirmDialog('¿Estás seguro que deseas aceptar esta requisición?', 'Cancelar', 'Aceptar').then((result) => {
      if (result.value) {
        this.requisitionService.accept(id).subscribe( res => {
          if (res.status){
            successDialog(res.message).then(() => {
              this.loadRequests()
            })
          } else{
            errorMessage(res.message)
          }
        }, error => {
          errorMessage(error)
        })
      }
    })
  }

  finishRequest(id){
    confirmDialog('¿Estás seguro que deseas finalizar esta requisición?', 'Cancelar', 'Aceptar').then((result) => {
      if (result.value) {
        this.requisitionService.finish(id).subscribe( res => {
          if (res.status){
            successDialog(res.message).then(() => {
              this.loadRequests()
            })
          } else{
            errorMessage(res.message)
          }
        }, error => {
          errorMessage(error)
        })
      }
    })
  }
  getData(){
    this.user = JSON.parse(this.authService.getData())
    
    this.privileges.see = !!this.user.pageFaculties.find(i => i.page.name === 'Requisiciones' && i.faculty.name === 'ver')
    this.privileges.create = !!this.user.pageFaculties.find(i => i.page.name === 'Requisiciones' && i.faculty.name === 'crear')
    this.privileges.edit = !!this.user.pageFaculties.find(i => i.page.name === 'Requisiciones' && i.faculty.name === 'editar')
    this.privileges.cancel = !!this.user.pageFaculties.find(i => i.page.name === 'Requisiciones' && i.faculty.name === 'cancelar')
    this.privileges.authorize = !!this.user.pageFaculties.find(i => i.page.name === 'Requisiciones' && i.faculty.name === 'autorizar')
    this.privileges.reject = !!this.user.pageFaculties.find(i => i.page.name === 'Requisiciones' && i.faculty.name === 'rechazar')
    this.privileges.finish = !!this.user.pageFaculties.find(i => i.page.name === 'Requisiciones' && i.faculty.name === 'finalizar')
    console.log(this.privileges)
  }
}

