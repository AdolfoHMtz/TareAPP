import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TareaService } from '../services/tarea-service.service';
import { Tarea } from '../interface/tarea.interface';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {

  tareas: Tarea[] = [];
  tareasSubscription?: Subscription;
  cargando = true;

  constructor(
    private router: Router,
    private tareaService: TareaService
  ) {}

  ngOnInit() {
    this.cargarTareas();
  }

  ngOnDestroy() {
    if (this.tareasSubscription) {
      this.tareasSubscription.unsubscribe();
    }
  }

  private cargarTareas() {
    this.cargando = true;
    this.tareasSubscription = this.tareaService.obtenerTareas().subscribe({
      next: (tareas) => {
        this.tareas = tareas;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar tareas:', error);
        this.cargando = false;
      }
    });
  }

  irCrearTarea() {
    this.router.navigate(['/tarea']);
  }

  verDetalles(tareaId: string) {
    this.router.navigate(['/tarea-detalles', tareaId]);
  }

  formatearFecha(fecha: string): string {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

}
