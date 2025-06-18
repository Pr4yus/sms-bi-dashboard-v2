# Updater Scripts Collection

Colección de scripts para actualización automática de datos de transacciones, órdenes y conversaciones para las plataformas CSM y Reach.

## Descripción

Este proyecto contiene cuatro scripts principales que se ejecutan diariamente para mantener actualizadas las estadísticas de diferentes servicios:

1. **allSMS.js**: Procesa transacciones SMS de todas las instancias de CSM (GT, CA-SV, CA-HN, CA-NI, CR, TIGO_HN, CARG)
2. **TRReach.js**: Procesa transacciones SMS específicas de la plataforma Reach
3. **conversationstodbmaria.js**: Procesa estadísticas de conversaciones de Reach
4. **orderstodbmaria.js**: Procesa órdenes y pagos de Reach

## Características

- Actualización automática diaria
- Procesamiento día por día
- Manejo de zona horaria GTM-6 (América/Guatemala)
- Logs independientes para cada script
- Verificación de último día procesado
- Prevención de procesamiento de fechas futuras

## Requisitos

- Node.js
- MongoDB
- MariaDB
- Paquetes npm:
  - mongodb
  - mysql2
  - luxon
  - csv-writer (solo para allSMS.js)

## Instalación

1. Clonar el repositorio:
```bash
git clone http://git.im.local/support/updater-analysis01ubq.git
cd updater-analysis01ubq
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar el crontab:
```bash
crontab -e
```

4. Agregar las siguientes líneas al crontab:
```bash
# Ejecutar todos los días a las 2 AM
0 2 * * * /usr/bin/node /ruta/completa/orderstodbmaria.js >> /var/log/orders-updater.log 2>&1
0 2 * * * /usr/bin/node /ruta/completa/conversationstodbmaria.js >> /var/log/conversations-updater.log 2>&1
0 2 * * * /usr/bin/node /ruta/completa/TRReach.js >> /var/log/reach-updater.log 2>&1
0 2 * * * /usr/bin/node /ruta/completa/allSMS.js >> /var/log/sms-updater.log 2>&1
```

## Funcionamiento

Cada script:
1. Verifica la última fecha procesada en su colección correspondiente
2. Si no hay registros previos, comienza desde hace 2 días
3. Procesa el siguiente día después del último registro
4. Guarda los resultados en la base de datos
5. Genera logs de la ejecución

### Colecciones MongoDB utilizadas

- **allSMS.js**: `account_transactions_gtbyday`
- **TRReach.js**: `account_transactions_gtbyday` (en base de datos de Reach)
- **conversationstodbmaria.js**: `conversations_account_type`
- **orderstodbmaria.js**: `orders_bychannel`

## Monitoreo

Los logs se pueden encontrar en:
- `/var/log/orders-updater.log`
- `/var/log/conversations-updater.log`
- `/var/log/reach-updater.log`
- `/var/log/sms-updater.log`

## Mantenimiento

Para verificar el estado de los scripts:
1. Revisar los logs en `/var/log/`
2. Verificar las últimas fechas procesadas en cada colección
3. Comprobar el estado del crontab: `crontab -l`

## Solución de problemas

Si un script falla:
1. Verificar los logs correspondientes
2. Asegurar que las bases de datos estén accesibles
3. Comprobar permisos de escritura en logs
4. Verificar que la zona horaria del servidor sea correcta

## Soporte

Para soporte contactar al equipo de desarrollo:
- Email: support@im.gt
