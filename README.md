# ✅ TareAPP: gestor de tareas

Aplicación móvil para **organizar tareas pendientes**: crea tareas con fecha de vencimiento, consulta su detalle, edítalas, márcalas como completadas o elimínalas. Las tareas se guardan en el dispositivo, así que siguen ahí al cerrar la app.

<p align="center">
  <a href="https://stately-longma-2938d1.netlify.app" target="_blank" rel="noopener">
    <img src="https://img.shields.io/badge/%F0%9F%9A%80%20Abrir%20app%20en%20vivo-00C7B7?style=for-the-badge&logo=netlify&logoColor=white" alt="Abrir en Netlify" />
  </a>
</p>

![Angular](https://img.shields.io/badge/Angular-20-DD0031?style=flat-square&logo=angular&logoColor=white)
![Ionic](https://img.shields.io/badge/Ionic-8-3880FF?style=flat-square&logo=ionic&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-B7178C?style=flat-square&logo=reactivex&logoColor=white)

## ✨ Funcionalidades

- **CRUD completo:** crear, ver, editar y eliminar tareas.
- **Validaciones:** nombre obligatorio de al menos 3 caracteres, descripción obligatoria y fecha de vencimiento de hoy en adelante.
- **Estado reactivo** con `BehaviorSubject` de RxJS: la lista se actualiza sola en todas las pantallas.
- **Persistencia local** con `localStorage`.
- **Diseño mobile-first** con componentes de Ionic.

## 📂 Estructura

```
src/app/
├── home/                    Lista de tareas
├── pages/
│   ├── tarea/               Formulario para crear una tarea
│   └── tarea-detalles/      Detalle, edición y eliminación
├── services/
│   └── tarea-service.service.ts   Lógica, validación y almacenamiento
└── interface/
    └── tarea.interface.ts   Modelo de datos
```

## 🚀 Cómo ejecutarlo

```bash
npm install
ionic serve      # o: npm start
```

Requisitos: Node 18+ y, opcionalmente, Ionic CLI (`npm i -g @ionic/cli`).

## 👨‍💻 Autor

**Adolfo Huerta** · [@AdolfoHMtz](https://github.com/AdolfoHMtz) · 2025
