import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Tarea, Interface } from '../interface/tarea.interface';

@Injectable({
  providedIn: 'root'
})
export class TareaService {
  private readonly CLAVE_STORAGE = 'tareas_app';
  private tareasSubject = new BehaviorSubject<Tarea[]>([]);
  public tareas$ = this.tareasSubject.asObservable();

  constructor() {
    this.cargarTareas();
  }

  private cargarTareas(): void {

    try {
      const tareasGuardadas = localStorage.getItem(this.CLAVE_STORAGE);
      if (tareasGuardadas) {
        const tareas = JSON.parse(tareasGuardadas) as Tarea[];
        this.tareasSubject.next(tareas);
      }
    } catch (error) {
      console.error('Error al cargar las tareas:', error);
      this.tareasSubject.next([]);
    }
  }

  private guardarEnStorage(tareas: Tarea[]): void {
    try {
      localStorage.setItem(this.CLAVE_STORAGE, JSON.stringify(tareas));
      this.tareasSubject.next(tareas);
    } catch (error) {
      console.error('Error al guardar las tareas:', error);
      throw new Error('No se pudo guardar las tareas');
    }
  }

  private generarId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  public validarTarea(datosTarea: Interface): { valida: boolean; errores: string[] } {
    const errores: string[] = [];
    if (!datosTarea.nombre || datosTarea.nombre.trim().length === 0) {
      errores.push('El nombre de la tarea es obligatorio');
    } else if (datosTarea.nombre.trim().length < 3) {
      errores.push('El nombre debe tener al menos 3 caracteres');
    }
    if (!datosTarea.descripcion || datosTarea.descripcion.trim().length === 0) {
      errores.push('La descripción de la tarea es obligatoria');
    }
    if (!datosTarea.fecha) {
      errores.push('La fecha de vencimiento es obligatoria');
    } else {
      const fechaSeleccionada = new Date(datosTarea.fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaSeleccionada < hoy) {
        errores.push('La fecha de vencimiento debe ser hoy o una fecha futura');
      }
    }
    return {
      valida: errores.length === 0,
      errores
    };
  }

  public obtenerTareas(): Observable<Tarea[]> {
    return this.tareas$;
  }

  public obtenerTareasArray(): Tarea[] {
    return this.tareasSubject.value;
  }

  public obtenerTareaPorId(id: string): Tarea | null {
    const tareas = this.tareasSubject.value;
    return tareas.find(tarea => tarea.id === id) || null;
  }

  public crearTarea(datosTarea: Interface): { exito: boolean; mensaje: string; tarea?: Tarea } {
    try {
      const validacion = this.validarTarea(datosTarea);
      if (!validacion.valida) {
        return {
          exito: false,
          mensaje: validacion.errores.join('\n')
        };
      }
      const nuevaTarea: Tarea = {
        id: this.generarId(),
        nombre: datosTarea.nombre.trim(),
        descripcion: datosTarea.descripcion.trim(),
        fecha: datosTarea.fecha,
        fechaCreacion: new Date().toISOString(),
        completada: false
      };
      const tareasActuales = this.obtenerTareasArray();
      const nuevasTareas = [...tareasActuales, nuevaTarea];
      this.guardarEnStorage(nuevasTareas);
      return {
        exito: true,
        mensaje: 'Tarea creada exitosamente',
        tarea: nuevaTarea
      };
    } catch (error) {
      console.error('Error al crear tarea:', error);
      return {
        exito: false,
        mensaje: 'Error al crear la tarea. Inténtalo de nuevo.'
      };
    }
  }
  public actualizarTarea(id: string, datosActualizados: Partial<Interface>): { exito: boolean; mensaje: string } {
    try {
      const tareasActuales = this.obtenerTareasArray();
      const indice = tareasActuales.findIndex(tarea => tarea.id === id);
      if (indice === -1) {
        return {
          exito: false,
          mensaje: 'Tarea no encontrada'
        };
      }
      const tareaActualizada = {
        ...tareasActuales[indice],
        ...datosActualizados
      };
      if (datosActualizados.nombre || datosActualizados.descripcion || datosActualizados.fecha) {
        const datosParaValidar: Interface = {
          nombre: tareaActualizada.nombre,
          descripcion: tareaActualizada.descripcion,
          fecha: tareaActualizada.fecha
        };
        const validacion = this.validarTarea(datosParaValidar);
        if (!validacion.valida) {
          return {
            exito: false,
            mensaje: validacion.errores.join('\n')
          };
        }
      }
      tareasActuales[indice] = tareaActualizada;
      this.guardarEnStorage(tareasActuales);
      return {
        exito: true,
        mensaje: 'Tarea actualizada exitosamente'
      };
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      return {
        exito: false,
        mensaje: 'Error al actualizar la tarea. Inténtalo de nuevo.'
      };
    }
  }

  public eliminarTarea(id: string): { exito: boolean; mensaje: string } {
    try {
      const tareasActuales = this.obtenerTareasArray();
      const nuevasTareas = tareasActuales.filter(tarea => tarea.id !== id);

      if (nuevasTareas.length === tareasActuales.length) {
        return {
          exito: false,
          mensaje: 'Tarea no encontrada'
        };
      }
      this.guardarEnStorage(nuevasTareas);
      return {
        exito: true,
        mensaje: 'Tarea eliminada exitosamente'
      };
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      return {
        exito: false,
        mensaje: 'Error al eliminar la tarea. Inténtalo de nuevo.'
      };
    }
  }
}
