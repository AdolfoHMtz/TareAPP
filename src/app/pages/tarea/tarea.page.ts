import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { TareaService } from '../../services/tarea-service.service';
import { Interface } from '../../interface/tarea.interface';

@Component({
  selector: 'app-tarea',
  templateUrl: './tarea.page.html',
  styleUrls: ['./tarea.page.scss'],
  standalone: false
})
export class TareaPage implements OnInit {

  formularioTarea: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private tareaService: TareaService
  ) {
    this.formularioTarea = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required]],
      fecha: ['', [Validators.required, this.validadorFechaFutura]]
    });
  }

  ngOnInit() {
    const hoy = new Date().toISOString().split('T')[0];
    const campoFecha = this.formularioTarea.get('fecha');
    if (campoFecha) {
      campoFecha.setValue(hoy);
    }
  }

  validadorFechaFutura(control: any) {
    if (!control.value) return null;
    const fechaSeleccionada = new Date(control.value);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaSeleccionada < hoy) {
      return { fechaPasada: true };
    }
    return null;
  }

  async guardar() {
    if (this.formularioTarea.valid) {
      const loading = await this.loadingController.create({
        message: 'Guardando tarea...',
        duration: 3000
      });
      await loading.present();

      try {
        const datosFormulario: Interface = this.formularioTarea.value;
        const resultado = this.tareaService.crearTarea(datosFormulario);
        await loading.dismiss();

        if (resultado.exito) {
          const alert = await this.alertController.create({
            header: '¡Tarea Creada!',
            message: `La tarea "${datosFormulario.nombre}" ha sido guardada exitosamente.`,
            buttons: [
              {
                text: 'OK',
                handler: () => {
                  this.router.navigate(['/home']);
                }
              }
            ]
          });
          await alert.present();
        } else {
          await this.mostrarErrorPersonalizado('Error de Validación', resultado.mensaje);
        }

      } catch (error) {
        await loading.dismiss();
        console.error('Error al guardar tarea:', error);
        await this.mostrarErrorPersonalizado(
          'Error',
          'Ocurrió un error inesperado al guardar la tarea. Inténtalo de nuevo.'
        );
      }
    } else {
      await this.mostrarErroresValidacion();
    }
  }

  async cancelar() {
    const alert = await this.alertController.create({
      header: 'Cancelar',
      message: '¿Estás seguro de que quieres cancelar? Se perderán los datos ingresados.',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Sí, cancelar',
          handler: () => {
            this.router.navigate(['/home']);
          }
        }
      ]
    });
    await alert.present();
  }

  private async mostrarErroresValidacion() {
    let mensajeError = 'Por favor, corrige los siguientes errores:\n\n';
    const controles = this.formularioTarea.controls;
    if (controles['nombre'].errors) {
      if (controles['nombre'].errors['required']) {
        mensajeError += '• El nombre de la tarea es obligatorio\n';
      }
      if (controles['nombre'].errors['minlength']) {
        mensajeError += '• El nombre debe tener al menos 3 caracteres\n';
      }
    }
    if (controles['descripcion'].errors) {
      if (controles['descripcion'].errors['required']) {
        mensajeError += '• La descripción de la tarea es obligatoria\n';
      }
    }
    if (controles['fecha'].errors) {
      if (controles['fecha'].errors['required']) {
        mensajeError += '• La fecha de vencimiento es obligatoria\n';
      }
      if (controles['fecha'].errors['fechaPasada']) {
        mensajeError += '• La fecha debe ser hoy o una fecha futura\n';
      }
    }
    await this.mostrarErrorPersonalizado('Errores de Validación', mensajeError);
  }
  private async mostrarErrorPersonalizado(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }
  get tareaForm() {
    return this.formularioTarea;
  }
}
