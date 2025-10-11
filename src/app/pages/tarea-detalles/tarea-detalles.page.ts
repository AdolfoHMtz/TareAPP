import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { TareaService } from '../../services/tarea-service.service';
import { Tarea } from '../../interface/tarea.interface';

@Component({
  selector: 'app-tarea-detalles',
  templateUrl: './tarea-detalles.page.html',
  styleUrls: ['./tarea-detalles.page.scss'],
  standalone: false
})
export class TareaDetallesPage implements OnInit {

  tarea: Tarea | null = null;
  formularioTarea: FormGroup;
  modoEdicion = false;
  cargando = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
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
    this.cargarTarea();
  }

  private cargarTarea() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.mostrarError('Error', 'No se proporcionó un ID de tarea válido');
      this.router.navigate(['/home']);
      return;
    }

    this.tarea = this.tareaService.obtenerTareaPorId(id);

    if (!this.tarea) {
      this.mostrarError('Tarea no encontrada', 'La tarea solicitada no existe');
      this.router.navigate(['/home']);
      return;
    }

    // Cargar datos en el formulario
    this.formularioTarea.patchValue({
      nombre: this.tarea.nombre,
      descripcion: this.tarea.descripcion,
      fecha: this.tarea.fecha
    });

    this.cargando = false;
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

  toggleModoEdicion() {
    this.modoEdicion = !this.modoEdicion;
    if (!this.modoEdicion) {
      this.formularioTarea.patchValue({
        nombre: this.tarea?.nombre,
        descripcion: this.tarea?.descripcion,
        fecha: this.tarea?.fecha
      });
    }
  }

  async guardarCambios() {
    if (!this.tarea || !this.formularioTarea.valid) {
      await this.mostrarErroresValidacion();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Guardando cambios...',
      duration: 3000
    });
    await loading.present();

    try {
      const datosActualizados = this.formularioTarea.value;
      const resultado = this.tareaService.actualizarTarea(this.tarea.id, datosActualizados);

      await loading.dismiss();

      if (resultado.exito) {
        this.tarea = { ...this.tarea, ...datosActualizados };
        this.modoEdicion = false;
        const alert = await this.alertController.create({
          header: '¡Tarea Actualizada!',
          message: 'Los cambios han sido guardados exitosamente.',
          buttons: ['OK']
        });
        await alert.present();
      } else {
        await this.mostrarError('Error de Validación', resultado.mensaje);
      }

    } catch (error) {
      await loading.dismiss();
      console.error('Error al actualizar tarea:', error);
      await this.mostrarError(
        'Error',
        'Ocurrió un error inesperado al guardar los cambios. Inténtalo de nuevo.'
      );
    }
  }

  async eliminarTarea() {
    if (!this.tarea) return;

    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar la tarea "${this.tarea.nombre}"? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.confirmarEliminacion();
          }
        }
      ]
    });

    await alert.present();
  }

  private async confirmarEliminacion() {
    if (!this.tarea) return;

    const loading = await this.loadingController.create({
      message: 'Eliminando tarea...',
      duration: 3000
    });
    await loading.present();

    try {
      const resultado = this.tareaService.eliminarTarea(this.tarea.id);
      await loading.dismiss();

      if (resultado.exito) {
        const alert = await this.alertController.create({
          header: 'Tarea Eliminada',
          message: 'La tarea ha sido eliminada exitosamente.',
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
        await this.mostrarError('Error', resultado.mensaje);
      }

    } catch (error) {
      await loading.dismiss();
      console.error('Error al eliminar tarea:', error);
      await this.mostrarError(
        'Error',
        'Ocurrió un error inesperado al eliminar la tarea. Inténtalo de nuevo.'
      );
    }
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
    await this.mostrarError('Errores de Validación', mensajeError);
  }

  private async mostrarError(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  formatearFecha(fecha: string): string {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

}
