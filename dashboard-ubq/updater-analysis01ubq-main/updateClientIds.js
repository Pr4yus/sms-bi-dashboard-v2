const { MongoClient } = require('mongodb');
const { DateTime } = require('luxon');

// Configuración de las instancias (igual que tu script original)
const instances = [
    {
        name: 'GT',
        host: 'mongo01-claro-csm-gt.im.local',
        database: 'csm_gt_claro',
        collection: 'account_transactions_gtbyday'
    },
    {
        name: 'CA-SV',
        host: 'mongo01-claro-csm-ca.im.local',
        database: 'csm_sv_claro',
        collection: 'account_transactions_gtbyday'
    },
    {
        name: 'CA-HN',
        host: 'mongo01-claro-csm-ca.im.local',
        database: 'csm_hn_claro',
        collection: 'account_transactions_gtbyday'
    },
    {
        name: 'CA-NI',
        host: 'mongo01-claro-csm-ca.im.local',
        database: 'csm_ni_claro',
        collection: 'account_transactions_gtbyday'
    },
    {
        name: 'CR',
        host: 'mongo01-claro-csm-cr.im.local',
        database: 'csm_cr_claro',
        collection: 'account_transactions_gtbyday'
    },
    {
        name: 'TIGO_HN',
        host: 'mongo01-tigo-csm-hnec.im.local',
        database: 'csm_hn_tigo',
        collection: 'account_transactions_gtbyday'
    },
    {
        name: 'CARG',
        host: 'mongo01-claro-csm-carg.im.local',
        database: 'csm_carg_claro',
        collection: 'account_transactions_gtbyday'
    }
];

// Definir los mapeos de IDs por país
const idMappings = {
    GT: {
        '5.71796.45.00.100114': 'BANCO GTC',
        '1.10001303_pendiente_migrar': 'OMNILIFE',
        '1.18797469': 'ADELANTOS',
        '1.21546874': 'Pro Mujer Guatemala',
        '1.18124330': 'GAS ZETA',
        '4.3679.00.00.100000': 'WALMART - WIFI',
        '1.10000123': 'INGENIO MAGDALENA',
        '3.232.00.00.100004': 'ASEGURADORA GENERAL',
        '6.136819.00.00.100001': 'SEÑAL NACIONAL',
        '6.127824.00.00.100000': 'ASOCIACION AWAKENING',
        '6.121415.00.00.100000': 'FINCA GUATEMALA',
        '4.3485.00.00.100000': 'INTERCONSUMO',
        '3.378.00.00.100027': 'TABACALERA CENTROAMERICANA',
        '5.73381.00.00.100000': 'INCOMEL',
        '4.3313.00.00.100007_pendiente_migrar': 'BANCO INTERNACIONAL',
        '4.5571.00.00.100001': 'HABITAT',
        '5.77838.00.00.100000': 'SONRIE, ADMINISTRACION',
        '3.326.00.00.100019': 'BANCO GYT CONTINENTAL (EMBARGOS)',
        '5.99832.00.00.100001': 'CIAM',
        '6.126412.00.00.100000': 'SEGUROS G&T',
        '5.75122.00.00.100000': 'DIDEMA',
        '4.1444': 'GEA DE GUATEMALA',
        '4.3485.00.00.100002': 'INTERCONSUMO',
        '5.93849.00.00.100013': 'BANCO INDUSTRIAL',
        '6.141923.00.00.100000': 'AUDICONTA RABI',
        '6.137574.00.00.100005': 'SAT GERENCIA REGIONAL SUR',
        '4.5619.00.00.100001': 'ARISA',
        '4.1453.00.00.100003': 'AGEXPORT',
        '5.93849.00.00.100000': 'BANCO INDUSTRIAL',
        '4.3613.00.00.100000': 'TRANSACCIONES Y TRANSFERENCIAS',
        '5.47440.00.00.100001': 'REGISTRO DE LA PROPIEDAD INTELECTUAL',
        '6.136392.00.00.100000': 'Servicio Integral de Cobranza Sicobra',
        '6.136224.00.00.100006': 'CONTRALORIA GENERAL DE CUENTAS',
        '4.5666': 'UMBRAL',
        '1.10011089_pendiente_migrar': 'MEYKOS',
        '1.10533748_pendiente_migrar': 'IGA',
        '1.20429577': 'COOPERATIVA COOITZA',
        '1.12707924': 'POLLO CAMPERO',
        '1502': 'MercadeoGyT TRAFICO OFF NET - TIGO - banco GTC',
        '5.71796.45.00.100111': 'Credomatic Guatemala',
        '6.118343.00.00.100000_pendiente_migrar': 'GUATEPRENDA',
        '1.20610652': 'FUNDAP - DESARROLLO',
        '1.21505334': 'EFEKTIVOS',
        '5.47421.00.00.100000': 'Corporación Amarillo, Sociedad Anónima',
        '1.19787215': 'PACAMAX, S.A.',
        '1.17072193': 'TL-COM',
        '1.21704422': 'APOYO INTEGRAL GUATEMALA, SOCIEDAD ANONIMA',
        '1.20631553': 'COOPE 7',
        '1.17421027_pendiente_migrar': 'GESEL, S.A.',
        '1.1812433': 'ZGAS',
        '1.21683022': 'MERCAFARMA',
        'ARISA': 'ARISA',
        '6.107414.00.00.100002': 'CREDITO HIPOTECARIO NACIONAL',
        'COOPE 7': 'COOPE 7',
        'CIAM': 'CIAM',
        '5.71796.43.00.100158': 'Claro Corp',
        'BANCO INTERNACIONAL': 'BANCO INTERNACIONAL',
        '5.71796.45.00.100103': 'VIVEPASS',
        'SONRIE, ADMINISTRACION': 'SONRIE, ADMINISTRACION',
        'Demo Claro GT': 'Demo Claro GT',
        '6.106126.00.00.100000': 'DROGUERIA CENTRO HISTORICO',
        'SAT_pendiente_migrar': 'SAT',
        'FUNDAP - DESARROLLO': 'FUNDAP - DESARROLLO',
        'Corporación Amarillo, Sociedad Anónima': 'Corporación Amarillo, Sociedad Anónima',
        'GRUPITO S.A.': 'NEXA BANCO',
        'ZGAS': 'ZGAS',
        'ADELANTOS': 'ADELANTOS',
        'WALMART - WIFI': 'WALMART - WIFI',
        'INGENIO MAGDALENA': 'INGENIO MAGDALENA',
        'GUATEPRENDA': 'GUATEPRENDA',
        'MERCAFARMA': 'MERCAFARMA',
        'BANCO INDUSTRIAL': 'BANCO INDUSTRIAL',
        'P_BANCO_GTC': 'Prueba BANCO GTC',
        'MOTORES HINO': 'MOTORES HINO',
        'INTERCONSUMO': 'INTERCONSUMO',
        'Servicio Integral de Cobranza Sicobra': 'Servicio Integral de Cobranza Sicobra',
        'COOPERATIVA COOITZA': 'COOPERATIVA COOITZA',
        'TEST SMS': 'TEST SMS',
        'DIDEMA': 'DIDEMA',
        'GYT_pendiente_migrar': 'BANCO GYT',
        'EFEKTIVOS': 'EFEKTIVOS',
        'SAT GERENCIA REGIONAL SUR': 'SAT GERENCIA REGIONAL SUR',
        'Demo Notificame': 'Demo Notificame',
        'test account': 'test backoffice',
        'POLLO CAMPERO': 'POLLO CAMPERO',
        '5.72627.00.00.100001': 'SOLUCIONES ACTIVAS Y SERVICIOS',
        '1.19591058': 'CORCHOS',
        'UMBRAL': 'UMBRAL',
        'demo': 'ELECTROMA',
        '4.1437.00.00.100000': 'Nuevos Almacenes',
        'AUDICONTA RABI': 'AUDICONTA RABI',
        'BANCO GYT CONTINENTAL (EMBARGOS)': 'BANCO GYT',
        'CONTRALORIA GENERAL DE CUENTAS': 'CONTRALORIA GENERAL DE CUENTAS',
        'GEA DE GUATEMALA': 'GEA DE GUATEMALA',
        'BANCO GYT': 'BANCO GYT',
        'GAS ZETA': 'GAS ZETA',
        'Cargo Expreso': 'Cargo Expreso',
        'SEGUROS G&T': 'SEGUROS G&T',
        'ASEGURADORA GENERAL': 'ASEGURADORA GENERAL',
        'Credomatic Guatemala': 'Credomatic Guatemala',
        'HABITAT': 'HABITAT',
        '5.71796.43.00.100143': 'Prueba Bolson BAM 1800k',
        '6.136721.00.00.100000': 'GRUPO TRT',
        'GESEL, S.A.': 'GESEL, S.A.',
        'APOYO INTEGRAL GUATEMALA, SOCIEDAD ANONIMA': 'APOYO INTEGRAL GUATEMALA, SOCIEDAD ANONIMA',
        'BANRURAL': 'BANRURAL',
        'WALMART': 'WALMART',
        '4.5636.00.00.100015': 'BACCREDOMATIC',
        'McDonals': 'McDonals',
        'PACAMAX, S.A.': 'PACAMAX, S.A.',
        'TRANSACCIONES Y TRANSFERENCIAS': 'TRANSACCIONES Y TRANSFERENCIAS',
        'SEÑAL NACIONAL': 'SEÑAL NACIONAL',
        'INCOMEL': 'INCOMEL',
        'TL-COM': 'TL-COM',
        'Pruebas GT': 'Pruebas GT',
        'MEYKOS': 'MEYKOS',
        'IGA': 'IGA',
        '6.139204.00.00.100000': 'Jose Jaime Moraes',
        '6.107414.00.00.100004':'BANCO CHN',
        '5.71796.43.00.100140':'PRODUCTOS SMS SEGMENTADO',
        '3.326.00.00.100019 ': 'BANCO GYT',
        'Procesos Dev1':'BANCO GYT',
        'BANCO GYT CONTINENTAL(CONSUMO)':'BANCO GYT',
        'BANCO GTC':'BANCO GYT',
        'sin_id': null,
        'SIN_CLIENT_ID_ASIGNADO': null,
        'SIN_CLIENT_ID_MARIA': null,
        'MercadeoGyT': 'BANCO GYT',
        'ELECTROMA': 'BANCO GYT',
        'MercadeoGyT TRAFICO OFF NET - TIGO - banco GTC': 'BANCO GYT',
        'BANCO GTC TG': 'BANCO GYT',
        'Prueba BANCO GTC': 'BANCO GYT',
        'BANCO G&T CONTINENTAL (TARJETAS)': 'BANCO GYT',
        'MercadeoGyT TRÁFICO ON NET - banco GTC': 'BANCO GYT',
        'BANCO GYT CONTINENTAL(CONSUMO)': 'BANCO GYT',
        'BANCO GTC': 'BANCO GYT',
        'BANCO GYT': 'BANCO GYT',
        'BANCO GYT CONTINENTAL (EMBARGOS)': 'BANCO GYT',
        'GYT_pendiente_migrar': 'BANCO GYT',
        'Procesos Dev1': 'BANCO GYT',
        '3.326.00.00.100019': 'BANCO GYT',
        '3.326.00.00.100019 ': 'BANCO GYT'
    },
    'CA-SV': {
        '17623602':'GAMMA LABORATORIES',
        '4.4483.10.00.100012':'Roaming El Salvador',
        'DAVIVIENDA JUDICIAL': 'DAVIVIENDA',
        'Banco Davivienda': 'DAVIVIENDA',
        'DAVIVIENDA': 'DAVIVIENDA',
        'Davivienda': 'DAVIVIENDA',
        'Davivienda ': 'DAVIVIENDA',
        'Davivienda22': 'DAVIVIENDA',
        '6435023': 'DAVIVIENDA',
        '77440005':'PROGRAMA MUNDIAL DE ALIMENTOS',
        // Mappings para El Salvador
    },
    'CA-HN': {
        // Mappings para Honduras (Claro)
    },
    'CA-NI': {
        'democlaro': 'Claro Notifícame Plataforma OTPs',
        '15568623': 'VSR DE NICARAGUA',
        'Dirección General de Ingresos': 'Direccion General de Ingresos',
        '9158420': 'Seguros America',
        '12815533': 'TRACKLINK S A',
        '10629768': 'INSTITUTO DE SEGURIDAD SOCIAL Y DESARROLLO - ISSDHU',
        'CLARO EMPRESAS NI': 'CLARO EMPRESAS NI',
        'Roaming Centroamérica': 'Roaming Centroamérica',
        '8399029': 'BioAnalisis',
        '12957834': 'DISTRIBUIDORA DE ELECTRICIDAD DEL NORTE',
        '9160370': 'Banco de America Central',
        'PRUEBASNI': 'PRUEBASNI',
        'Claro': 'Claro',  // Este manejará múltiples account_names
        '12741165 ': 'CLARO NICARAGUA'
    },
    'CR': {
        'CLARO - Cobros': 'CLARO - Cobros',
        '1729342': 'TELEDOLAR S. A.',
        'DEMO': 'Claro  -  Call Center',
        '2587758': 'PIZZA HUT 2',
        '1782689': 'Coopecredit',
        '2259629': 'CORPORACION DE SUPERMERCADOS UNIDOS SOCIEDAD DE RESPONSABILIDAD LIMITADA',
        '72917381': 'GESTIONADORA DE CREDITOS DE SJ S.A',
        '2379659': 'VIA GALICIA XXI LIMITADA',
        '2617059': 'CONEXION COMERCIAL MOVIL LATAM SOCIEDAD ANONIMA',
        'NETCOM BUSINESS CONTACT CENTER SOCIEDAD ANONIMA': 'NETCOM BUSINESS CONTACT CENTER SOCIEDAD ANONIMA',
        '1083777': 'DIGITAL SAT SOCIEDAD ANONIMA',
        '1914440': 'COOPERATIVA DE SERVICIOS MULTIPLES DE MAESTROS PROFESORES PENSIONADOS',
        '3102912265': 'YAWASKA SOCIEDAD DE RESPONSABILIDAD LIMITADA',
        '2602874': 'COOPERATIVA NACIONAL DE EDUCADORES R.L.',
        '2649584': 'Mercadeo Credix',
        '3101616542': 'CRUX CONSULTORES SOCIEDAD ANONIMA',
        '2209032': 'COOPENAE RL - Principal',
        '2171102': 'PRUEBAS SAC',
        '1230286': 'RECAUDADORA MAYA SOCIEDAD ANONIMA',
        '2141863': 'TAD TECNOLOGIAS DE AVANZADA PARA EL DESARROLLO SOCIEDAD ANONIMA',
        'Cobros Credix': 'Cobros Credix',
        'MOVIL TECH SUPPLY INC S.A': 'MOVIL TECH SUPPLY INC S.A',
        '1371879': 'NETCOM BUSINESS CONTACT CENTER SOCIEDAD ANONIMA',
        '3101763455': 'ZIMPLIFICA SOCIEDAD ANONIMA',
        '2135641': 'PRUEBAS MERCADEO SEGMENTO CORP',
        '1136485': 'ALUDEL LIMITADA',
        'PROD': 'MSAGE LATAM EMPRESA INDIVIDUAL DE RESPONSABILIDAD LIMITADA',
        '2246206': 'HNG CARMENTA GLOBAL GROUP',
        '2452727': 'SERVICIO DE NOTIFICACIONES NOTARIALES SENN DE COSTA RICA SOCIEDAD ANONIMA',
        '2152286': 'PCPURIS SOCIEDAD ANONIMA',
        '2467929': 'KHARPA SOCIEDAD AGENCIA DE SEGUROS S.A',
        '3101229292': 'BANCO IMPROSA S.A',
        'Universidad Metropolitana Castro Carazo': 'Universidad Metropolitana Castro Carazo',
        'CONSULT - IT SOCIEDAD ANONIMA': 'CONSULT - IT SOCIEDAD ANONIMA',
        '1280011': 'Instituto de Formacion Aeronautica',
        '2487291': 'FOUNDEVER COSTA RICA S. A.',
        '2486312': 'SOLUCIONES INFORMATICAS INTERNACIONALES S.A',
        'GRUPO INTERFAZ ': 'GRUPO INTERFAZ',
        'prod-payment-processor Wink': 'prod-payment-processor Wink',
        '397498': 'CARLOS GUILLEN RUIZ',
        '1804561': 'SALUDAUNCLIC SOCIEDAD ANONIMA',
        '2480785': 'FINANCIERA GENTE SOCIEDAD ANONIMA',
        '3102755451': 'Canton H K Central de Alimentos S.R.L',
        'American Data Networks S.A': 'American Data Networks S.A',
        '500698': 'Distribuidora de Materiales y Asociados DIDEMA SRL',
        '164991': 'Celltracker S.A',
        '2168146': 'ARTIFEX CONSULTING SOCIEDAD ANONIMA',
        '3101675402': 'MEDISMART',
        'COOPENAE RL Wink': 'COOPENAE RL Wink',
        'Mercadeo CSF': 'Mercadeo CSF',
        'BANCO DAVIVIENDA (COSTA RICA) SA': 'BANCO DAVIVIENDA (COSTA RICA) SA',
        'Cuenta Demo CR': 'Cuenta DEMO CR',
        'FINANCIERA DESYFIN SOCIEDAD ANONIMA': 'FINANCIERA DESYFIN SOCIEDAD ANONIMA',
        '1330303': 'CONECTE DE COSTA RICA SOCIEDAD ANONIMA',
        '3101314178': 'RED LOGISTIC INTERNACIONAL SOCIEDAD ANONIMA',
        '2125349': 'MUNICIPALIDAD DEL CANTON DE SANTA ANA',
        '2134213': 'RIDIVI S. A.',
        '2258397': 'CREDISERVER SA',
        '2007130': 'QUÁLITAS COMPAÑÍA DE SEGUROS',
        '3101183300': 'TECNOSISTEMAS PRIDESSA S.A',
        '3102189003': 'ALUDEL LIMITADA',
        '1307314': 'JDS GESTION DINAMICA S. A.',
        'MSAGE LATAM EMPRESA INDIVIDUAL DE RESPONSABILIDAD LIMITADA': 'MSAGE LATAM EMPRESA INDIVIDUAL DE RESPONSABILIDAD LIMITADA',
        '2345503': 'RESUELVA SOCIEDAD ANONIMA',
        '3101687532': 'GRUPO CORPORATIVO CRS SOCIEDAD DE RESPONSABILIDAD LIMITADA',
        '2058808': 'DPCR FOODS SOCIEDAD ANONIMA',
        'Banco Nacional ': 'Banco Nacional',
        '447940': 'ASEGURADORA DEL ISTMO ( ADISA ) SOCIEDAD ANONIMA',
        '488127': 'CAMPOSANTOS LA PIEDAD S. A.',
        '1714991': 'BALIO CONSULTING SERVICES S.A.',
        '3101395168': 'ARKKOSOFT SOCIEDAD ANONIMA',
        '1799336': 'CIS CONTEL INTEGRAL SOLUTIONS SOCIEDAD ANONIMA',
        '3101046008': 'BANCO DAVIVIENDA (COSTA RICA) S.A.',
        '2698961': 'PAY TECH SOLUTIONS',
        'ASEBAC': 'ASEBAC',
        '302727': 'AEROCASILLAS SA',
        'CoopeSanMarcos': 'CoopeSanMarcos',
        '1556611': 'DPS',
        '2337277': 'SEA Servicios Múltiples de Costa Rica S.A.',
        '3002750991': 'ASOCIACION COSTARRICENSE DE MOVILIDAD ELECTRICA',
        'GESTIONADORA DE CREDITO DE SJ S.A': 'GESTIONADORA DE CREDITO DE SJ S.A',
        'DEMOCLARO': 'Demo Claro CR',
        '1704315': 'TE CONTACTO CONTACT CENTER S.A',
        'Credix Automáticos': 'Credix Automáticos',
        '283251': 'Sandra Patricia Meza Dall Anese',
        '2967508': 'ISTMO CENTER SOCIEDAD ANONIMA',
        '3101360668': 'NETCOM BUSINESS CONTACT CENTER SOCIEDAD ANONIMA',
        'LABIN': 'LABIN',
        'GRUPO PRIDES S.A': 'GRUPO PRIDES S.A',
        '1522658': 'CREDECOOP',
        '232086': 'CREDISERVER SOCIEDAD ANONIMA',
        '1607437': 'GESTIONADORA INTERNACIONAL SERVICREDITO SOCIEDAD ANONIMA',
        '2416024': 'TRACKLINK SOCIEDAD ANONIMA',
        'aludel': 'ALUDEL ILIMITADA 1',
        '833665': 'ARABELA',
        'BARMENTECH SRL': 'BARMENTECH SRL',
        'FINANCIERA DESYFIN S. A.': 'FINANCIERA DESYFIN S. A.',
        '826796': 'BANCO DAVIVIENDA (COSTA RICA) SA',
        'CELL TECH SOLUTIONS': 'CELL TECH SOLUTIONS',
        'SEA Servicios Múltiples de Costa Rica S.A.': 'SEA Servicios Múltiples de Costa Rica S.A.',
        '2127536': 'GRUPO PRIDES S.A',
        '1974706': 'Claro Notifícame Plataforma OTPs',
        'prod-notifications Wink': 'prod-notifications Wink',
        '2289874': 'WIZTECH HOLDINGS SOCIEDAD ANONIMA',
        'TBX SOCIEDAD DE RESPONSABILIDAD LIMITADA//GIANPPIER ESNEIDER PAREJA AVILA': 'TBX SOCIEDAD DE RESPONSABILIDAD LIMITADA//GIANPPIER ESNEIDER PAREJA AVILA',
        '1485143': 'NETCOM BUSSINES CONTACT CENTER SOCIEDAD ANONIMA 4186'
        // Mappings para Costa Rica
    },
    'TIGO_HN': {
        '1-M856180399': 'LADY LEE',
        '1- F7009753486': 'COOP CEIBEÑA',
        '1-M6017899293': 'PConnection94310081',
        '1-M6012112436': 'INFOBIP COSTA RICA SOCIEDAD DE R. L. - TR NACIONAL 6684',
        '93072361': 'DEL CAMPO INTERNATIONAL SCHOOL S.A DE C.V',
        'SANDBOX': 'SANDBOX',
        '1-M23433263': 'RED TECNOLOGIA S.A. DE C.V.',
        'SUB ODEF - ORGANIZACION DE DESARROLLO EMPRESARIAL FEMENINO, S.A.': 'SUB ODEF - ORGANIZACION DE DESARROLLO EMPRESARIAL FEMENINO, S.A.',
        '1-M4070456522': 'SOLFISA SA DE CV',
        '1-M1777368440': 'SOCIEDAD EDUCATIVA SANTA MARIA',
        '1-M6013240467': 'MaxTVCable',
        '1-M4070435748': 'EMPIRE DE HONDURAS S.A.',
        '1-116508947141': 'COOP MIXTA 4 DE JUNIO',
        '1-M4070897845': 'Seguros Bolivar Honduras S.A',
        '1-M4070529227': 'PILARH OPDF',
        '1-M4070499899': 'CAMIONES Y MOTORES',
        '1-M2314090610': 'COOP.AHORRO Y CREDITO EMPLEADOS EMPRESA NACIONAL PORTUARIA',
        '1-F7004186609': 'Cooperativa San Marqueña',
        '1-M4069888244': 'FINANCIERA CREDIQ',
        '1-M2314075091': 'COOPERATIVA DE AHORRO Y CREDITO APAGUIZ LIMITADA',
        'Sport & Marketing': 'Sport & Marketing',
        '1-M4070044678': 'DATOS S DE R.L DE C.V',
        '1-M2314183347': 'AGUAS DE SAN PEDRO',
        '1-F7011330695': 'ADEL MICRO CREDITOS',
        'Tigo HN Demo 1': 'Tigo HN Demo 1',
        'SANDBOX BANPAIS': 'SANDBOX BANPAIS',
        '1-M856181985': 'PUBLIC - Ficohsa',
        '92629447': 'CLIENTE LA FUENTE CARGO S DE R.',
        '1-F7002822618': 'Farmacias del Ahorro',
        '1-M22143977': 'COOPERATIVA DE AHORRO Y CREDITO EDUCADORES DE HONDURAS -  COACEHL',
        '1-M6012112383': 'ENTURA',
        '1-M6016095402': 'COOPERATIVA DE AHORRO Y CREDITO SANMARQUENA 1',
        '1-M6016095377': 'COOPERATIVA DE AHORRO Y CREDITO SAN MARQUENA',
        '1-M6012112409': 'EMPRESA NACIONAL DE ENERGÍA ELÉCTRICA',
        '1-M22098543': 'CADELGA',
        '1-M2314108161': 'ARABELA HONDURAS S.A',
        '1-F7004175109': 'COBROS - BANPAIS',
        'demo': 'TIGO PLATAFORMA TOKENS',
        'Multihilos Pruebas': 'Multihilos Pruebas',
        '1-F7010033348': 'LABORATORIO BUESO ARIAS SA DE C.V.',
        '1-106639599434 /95262135': 'ACH',
        '1-F7009190580': 'GRUPO Q',
        '1-F7000871137': 'Carga Urgente de Honduras S.A.',
        '92344778': 'CREDIDEMO S DE R.L',
        'SANDBOX ODEF': 'SANDBOX ODEF',
        '1-M6019807202': 'INTERNATIONAL NURSERY SCHOOL S DE RL',
        '1-M4070695053': 'SEGUROS CREFISA S A',
        '1-f7009637667': 'FUNERALES SAN MIGUEL ARCANGEL S A C V',
        '1-F7005069323': 'ARANI INVESTMENT S.A.',
        'Tigo': 'TIGO DEMO COMERCIAL',
        '1-M6018953282': 'BANCO AZTECA',
        '50499598778': 'VOGUE CORPORATION INTERNATIONAL S A DE C V',
        '1-M22766920': 'UNIMERC',
        'CREDIMOTOR': 'CREDIMOTOR',
        '1-F7007160822': 'PRESTAMOS INMEDIATOS CASOL S DE R L',
        '1-M1541230166': 'Cooperativa Nueva Vida Limitada',
        '1-M3140568848': 'Lubricar Junior',
        '1-F7003735613': 'OUTSOURCING PARTNER SOLUTIONS (OPS)',
        'NUM ODEF ORGANIZACION DE DESARROLLO EMPRESARIAL FEMENINO, S.A.': 'NUM ODEF ORGANIZACION DE DESARROLLO EMPRESARIAL FEMENINO, S.A.',
        '1-F7005157540': 'INVERSIONES GLOBALES',
        '2424 - BANPAIS - PRIORIDAD 0 - Transaccional': '2424 - BANPAIS - PRIORIDAD 0 - Transaccional',
        '1-F7004448733': 'Cementos Argos Honduras - SMS',
        'TD - PINES  Chorotega': 'TD - PINES  Chorotega',
        'PENDIENTE MOVITEXT INTERNACIONAL': 'MOVITEX PANAMÁ S.A.',
        '1-F7001751233': 'GRUPO COBRANZAS LEGALES HONDURAS CENTROAMERICA, S. DE R.L',
        '1-117698857023': 'BANRURAL',
        '1-F7006322796': 'FERRECOMSA',
        'Tigo Business - REACH': 'Tigo Business - REACH',
        'pendiente': 'AMDC',
        '1-M6016762377': 'COMPANIA FINANCIERA S.A.',
        '1-F7007452366': 'El palacio de los niños, S. de R.L de C.V',
        '1-F7005457505': 'CREDIBUENO',
        '1-M4070241446': 'ZONA CABLE S DE RL DE CV',
        'SHEILIM  - automatizacion': 'SHEILIM  - automatizacion',
        '1-M6012112373': 'COOPERATIVA DE AHORRO Y CREDITO FRATERNIDAD PESPIRENSE LTDA',
        '1-M4069708547': 'ESCUELA PRIVADA RENACIMIENTO',
        '1-M6017292507': 'BANCO DAVIVIENDA - API',
        '1-M4070896962': 'POR SALUD - MEDICARD S.A de C.V',
        '1-F7007073602': 'FINANCIERA FINCA HONDURAS S.A.',
        ' 1- F7009753486':'COOP CEIBEÑA',
        ' 1-M6012112409':'EMPRESA NACIONAL DE ENERGÍA ELÉCTRICA',
        '1-116508947141':'COOP MIXTA 4 DE JUNIO',
        '1-116515771149':'Pinturas americanas',
        '1-M6012112439':'Cooperativa Mixta de Maestros Jubilados y Pensionados - 17 de Septiembre',
        '1-M856343700': 'SOLUZ HONDURAS',
        '18888098561': 'PROYECTOS DISRUPTIVOS S.A',
        '1-116508947141​':'COOP MIXTA 4 DE JUNIO '

    },
    'CARG': {
        'GT Super Facil': 'GMG',
        'GTC-Gallo': 'GMG',
        'GMG CR': 'GMG',
        'GTS-Cobros': 'GMG',
        'GMG COMERCIAL EL SALVADOR': 'GMG',
        'GTS-ADQ': 'GMG',
        'GTC-Serpento': 'GMG',
        'GMG GT': 'GMG',
        'GMG SV': 'GMG',
        'GMG': 'GMG',
        'SVC-Prado Alfa': 'GMG'
        
    }
};

async function updateClientIds(instance) {
    const client = new MongoClient(`mongodb://${instance.host}:27017/`);
    
    try {
        console.log(`\nActualizando IDs para ${instance.name}...`);
        await client.connect();
        
        const db = client.db(instance.database);
        const collection = db.collection(instance.collection);
        
        const countryMappings = idMappings[instance.name];
        if (!countryMappings) {
            console.log(`No hay mappings definidos para ${instance.name}`);
            return;
        }

        // Primero procesar los mappings regulares
        for (const [oldId, newId] of Object.entries(countryMappings)) {
            if (newId !== null) {  // Skip special cases
                const result = await collection.updateMany(
                    { client_id: oldId },
                    { 
                        $set: { 
                            client_id: newId,
                            last_updated: new Date(),
                            updated_by: 'christian.arias'
                        } 
                    }
                );

                console.log(`${instance.name} - ID ${oldId} -> ${newId}:`, {
                    encontrados: result.matchedCount,
                    actualizados: result.modifiedCount
                });
            }
        }

        // Procesar casos especiales (sin_id, etc.)
        const specialCases = ['sin_id', 'SIN_CLIENT_ID_ASIGNADO', 'SIN_CLIENT_ID_MARIA'];
        for (const specialCase of specialCases) {
            const result = await collection.updateMany(
                { client_id: specialCase },
                [
                    {
                        $set: {
                            client_id: '$account_name',
                            last_updated: new Date(),
                            updated_by: 'christian.arias'
                        }
                    }
                ]
            );

            console.log(`${instance.name} - Actualizando ${specialCase} con account_name:`, {
                encontrados: result.matchedCount,
                actualizados: result.modifiedCount
            });
        }

    } catch (error) {
        console.error(`Error en ${instance.name}:`, error);
    } finally {
        await client.close();
    }
}

async function main() {
    try {
        for (const instance of instances) {
            await updateClientIds(instance);
        }
        console.log("\n¡Proceso de actualización completado!");
    } catch (error) {
        console.error("Error en el proceso principal:", error);
    }
}

// Ejecutar el proceso
main(); 