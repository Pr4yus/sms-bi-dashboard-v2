# SMS BI Dashboard v2.0

Sistema de Business Intelligence para análisis de SMS con arquitectura moderna y escalable.

## 🚀 Características

- **Dashboard Regional**: Análisis consolidado de múltiples países
- **Análisis por País**: Métricas detalladas por país (Guatemala, Costa Rica, El Salvador, Nicaragua, Honduras)
- **Estructura Jerárquica**: Visualización de relaciones padre-hijo entre cuentas
- **Vista Comercial**: Agrupación por clientes para facturación
- **Análisis de Uso**: Evaluación de cumplimiento de paquetes SMS
- **API REST**: Endpoints optimizados con documentación Swagger
- **Cache Inteligente**: Sistema de caché para mejorar rendimiento
- **Monitoreo en Tiempo Real**: Health checks y métricas de sistema

## 🏗️ Arquitectura

```
sms-bi-dashboard-v2/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── sms-analytics/   # Módulo principal de análisis
│   │   ├── database/        # Servicios de base de datos
│   │   └── shared/          # Utilidades compartidas
│   └── docker-compose.yml   # Configuración Docker
├── frontend/                # Aplicación Next.js
│   ├── app/                 # Páginas y rutas
│   ├── components/          # Componentes React
│   └── lib/                 # Utilidades y configuración
└── docs/                    # Documentación técnica
```

## 🛠️ Tecnologías

### Backend
- **NestJS**: Framework para APIs
- **MongoDB**: Base de datos principal
- **TypeScript**: Tipado estático
- **Swagger**: Documentación de API
- **Docker**: Containerización

### Frontend
- **Next.js 14**: Framework React
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos
- **SWR**: Manejo de estado y caché
- **Chart.js**: Gráficos y visualizaciones

## 📊 Funcionalidades Principales

### 1. Dashboard Regional
- Métricas consolidadas de todos los países
- KPIs principales: total SMS, tasa de éxito, errores
- Análisis de cuentas clave por país

### 2. Análisis por País
- **Guatemala**: Análisis completo con jerarquía de cuentas
- **Otros países**: Preparado para expansión
- Métricas detalladas por período

### 3. Estructura Jerárquica
- Visualización de relaciones padre-hijo
- Análisis de cuentas agrupadas
- Métricas por nivel organizacional

### 4. Vista Comercial
- Agrupación por clientes
- Análisis de facturación
- Comparación balance vs paquete

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+
- Docker y Docker Compose
- MongoDB (local o remoto)

### Backend
```bash
cd backend
npm install
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker
```bash
docker-compose up -d
```

## 📈 Endpoints Principales

### Dashboard Regional
- `GET /api/sms-analytics/metrics/regional/:year/:month`
- `GET /api/sms-analytics/summary/regional`

### Análisis por País
- `GET /api/sms-analytics/analysis/country/:country/:year/:month`
- `GET /api/sms-analytics/accounts/:country/:year/:month`

### Estructura Jerárquica
- `GET /api/sms-analytics/:country/:year/:month/hierarchical-view`
- `GET /api/sms-analytics/:country/:year/:month/commercial-view`

## 🔧 Configuración

### Variables de Entorno
```env
# Backend
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=sms_analytics
PORT=3001

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📝 Documentación API

La documentación completa está disponible en:
- Swagger UI: `http://localhost:3001/api`
- OpenAPI JSON: `http://localhost:3001/api-json`

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo

## 🔄 Changelog

### v2.0.0
- ✅ Nueva arquitectura modular
- ✅ API optimizada con caché
- ✅ Dashboard regional consolidado
- ✅ Estructura jerárquica mejorada
- ✅ Documentación completa
- ✅ Docker support 