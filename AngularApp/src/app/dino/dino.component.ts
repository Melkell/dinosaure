import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { DinoService } from '../shared/dino.service';
import { Dino } from '../shared/dino.model';

declare let M: any;

@Component({
  selector: 'app-dino',
  templateUrl: './dino.component.html',
  styleUrls: ['./dino.component.css'],
  providers: [DinoService]
})
export class DinoComponent implements OnInit {

  constructor(public dinoService : DinoService) { }

  ngOnInit() {
    this.resetForm();
    this.refreshDinoList();
  }


  resetForm(form?: NgForm){
    if (form)
      form.reset();
    this.dinoService.selectedDino = {
      _id: "",
      fullName: "",
      age: "",
      famille: null,
      race: "",
      nourriture: "",
    }
  }

  onSubmit(form: NgForm){
    if(form.value._id == ""){

      this.dinoService.postDino(form.value).subscribe((res) => {
        this.resetForm(form);
        this.refreshDinoList();
        M.toast({ html : 'Saved !', classes: 'rounded' })
      });
    }
    else{
      this.dinoService.putDino(form.value).subscribe((res) => {
        this.resetForm(form);
        this.refreshDinoList();
        M.toast({ html : 'Updated !', classes: 'rounded' })
      });
    }
  }

  refreshDinoList() {
    this.dinoService.getDinoList().subscribe((res) => {
      this.dinoService.dinos = res as Dino[];
    });
  }

  onEdit(di : Dino){
    this.dinoService.selectedDino = di;
  }

  onDel(_id: string, form: NgForm) {
    if (confirm(`T'es sûr de supprimer ce contact ?`) == true) {
        this.dinoService.delDino(_id).subscribe((res) => {
          this.refreshDinoList();
          this.resetForm(form);
          M.toast({ html : 'Updated !', classes: 'rounded' })
        });
    }
  }

}
