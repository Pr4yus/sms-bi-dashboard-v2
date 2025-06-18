const { MongoClient, ObjectId } = require('mongodb');
const { DateTime } = require('luxon');

// Configuración de las instancias
const instances = [
    {
        name: 'REACH',
        host: 'mongo01-ubiquo-csm-ww.im.local',
        database: 'csm_ww_reach',
        collection: 'transactionspertype'
    },
    {
        name: 'CA-GT',
        host: 'mongo01-claro-csm-gt.im.local',
        database: 'csm_gt_claro',
        collection: 'transactionspertype'
    },
    {
        name: 'CA-SV',
        host: 'mongo01-claro-csm-ca.im.local',
        database: 'csm_sv_claro',
        collection: 'transactionspertype'
    },
    {
        name: 'CA-HN',
        host: 'mongo01-claro-csm-ca.im.local',
        database: 'csm_hn_claro',
        collection: 'transactionspertype'
    },
    {
        name: 'CA-NI',
        host: 'mongo01-claro-csm-ca.im.local',
        database: 'csm_ni_claro',
        collection: 'transactionspertype'
    },
    {
        name: 'CR',
        host: 'mongo01-claro-csm-cr.im.local',
        database: 'csm_cr_claro',
        collection: 'transactionspertype'
    },
    {
        name: 'TIGO_HN',
        host: 'mongo01-tigo-csm-hnec.im.local',
        database: 'csm_hn_tigo',
        collection: 'transactionspertype'
    },
    {
        name: 'REGIONAL',
        host: 'mongo01-claro-csm-carg.im.local',
        database: 'csm_carg_claro',
        collection: 'transactionspertype'
    }
];

// Mapeo de account_uids por país/instancia
const accountMappings = {
    'REACH': {
        'BAC': [
            new ObjectId("5f8a1d1d9594372fe109eef6"),
            new ObjectId("5d1691d33f044bad0e055775"),
            new ObjectId("5cfffcf08b52194e42c29880"),
            new ObjectId("5d1692353f044bad0e055796"),
            new ObjectId("62c5a6106c524e0feac774ff"),
            new ObjectId("5d1692783f044bad0e0557ac"),
            new ObjectId("65398d635110e81581c5305e"),
            new ObjectId("5d07bbe74f43bac362f7d928"),
            new ObjectId("611c3117305edb6d9c30fa2c"),
            new ObjectId("5d9fbefbd69942b93a0538d1"),
            new ObjectId("61e1b7e34dbac5736f33e806"),
            new ObjectId("64fb951fa5de337a8b49bfe9"),
            new ObjectId("6679aeeaa8f3d41ec77d1ef2"),
            new ObjectId("5cd9d05e25527ece1e56d816"),
            new ObjectId("5e7e3510862a902f7570473e"),
            new ObjectId("5d1692993f044bad0e0557b7"),
            new ObjectId("5d0023df8b52194e42c2988e"),
            new ObjectId("5cfab3f58b52194e42c29871"),
            new ObjectId("66a3cfe3fb3813b105166dd1"),
            new ObjectId("622b6c697e302f344ebda7be"),
            new ObjectId("622a9674feebbf34544a8530"),
            new ObjectId("5d1691a03f044bad0e05576a"),
            new ObjectId("5d1691f13f044bad0e055780"),
            new ObjectId("5dd401f69df4b3cb72e46d44"),
            new ObjectId("6679b3455db3d88d951ef282"),
            new ObjectId("62e92925de0fe346984e3666"),
            new ObjectId("5d1692143f044bad0e05578b"),
            new ObjectId("60183d8fecb04875766b99be"),
            new ObjectId("5e432f64bf7e41b90227b2da"),
            new ObjectId("5e6808bc862a902f7570472e"),
            new ObjectId("651eca29ac32b565b0c679f7"),
            new ObjectId("613a92acd99afc2a38dfb32b"),
            new ObjectId("5d1692c43f044bad0e0557c2"),
            new ObjectId("6679b2b9a8f3d41ec77d58e6"),
            new ObjectId("600225169a30ef363a25cc57"),
            new ObjectId("5f878a47eb93dd2fe7e86700"),
            new ObjectId("5db8792dacd801d17215203c")
        ],
        'NEXA BANCO': [
            new ObjectId("62eb00a71201ae1d75f6f94f"),
            new ObjectId("676f44904ad5880dc95d2394"),
            new ObjectId("652848e217b8775cd56f2e1d"),
            new ObjectId("66eb0cce37d08af164550b4c"),
            new ObjectId("66e5ea3941295290b8f95912")
        ],
        'NEOETHICALS': [
            new ObjectId("655fe00803231b158067db55"),
            new ObjectId("63eaad7af3a6a4478b2fe515"),
            new ObjectId("655fbf3a03231b1580650a9d")
        ],
        'DEMO': [
            new ObjectId("5d8a47bdd69942b93a0538ac"),
            new ObjectId("6658c6beefcbac3c1cbac06f"),
            new ObjectId("6658d735efcbac3c1cbb4753")
        ],
        'REACH': [
            new ObjectId("5cf95b1cef9af83742f553f2"),
            new ObjectId("5c50d54a38964bde40e66ca1"),
            new ObjectId("5fa2e2d4d6179c38e3b3c221")
        ],
        'QPAY': [
            new ObjectId("66ca75e32d85cbb6c34a6de8"),
            new ObjectId("66bcc788479d07904f265256")
        ],
        'Kyrabo': [
            new ObjectId("661d72ce188b7e22a97c7386"),
            new ObjectId("63912843eb08b347c99ca9a9")
        ],
        'SPORTSANDMARKETING': [
            new ObjectId("5ed4743dec7ba154db89e208")
        ],
        'TEST': [
            new ObjectId("5f4818d0eaf5b1570082551f"),
            new ObjectId("65d6b087dead4f7890053bcf"),
            new ObjectId("6675b40e933496bb2d04b712")
        ],
        'INFILE': [new ObjectId("5ed82ebaac407611cb881268")],
        'PENDIENTE': [new ObjectId("662fcc7272792193bb99a226")],
        'ACATE': [
            new ObjectId("66216880c1e75e9a9fa8e224"),
            new ObjectId("652435afd687386b4919316d")
        ],
        'movitext_gt': [new ObjectId("6515f8c6d687386b49d290e7")],
        'DEMO REACH': [new ObjectId("5b5257cece752607b61ffc09")],
        'GRUPO SUPERA': [new ObjectId("663b7c593332302f0f8f1206")],
        'dummy2019': [new ObjectId("66f450e0ce4e6c1c0166dd5a")],
        'RRHH': [new ObjectId("5d5ece183eb30bb33a7f68fc")],
        'Radiadores la Torre': [new ObjectId("679a809abab1014eda8b5149")],
        'LENDTECH': [new ObjectId("65a04dc5b1fe9eb975cc05c9")],
        'CSantos_Guatemala': [new ObjectId("646e5246561bb1405c9e438c")],
        'TRAEGUATE': [new ObjectId("5e84061aa15d703075858f06")],
        'UNISPICE': [new ObjectId("5eb0a911862a902f75704785")],
        'SLC': [new ObjectId("66a3f1ff4e50e37e5a21b41a")],
        'SLC Trade': [new ObjectId("67352ec1c05da567ac74a0ee")],
        'Corchos': [new ObjectId("679a914daa02f3067719aa14")],
        'MEGAPLAS': [new ObjectId("6421d81195a57657e2ec62d9")],
        'KALEA': [
            new ObjectId("610acae2e8b8e527e19a662f"),
            new ObjectId("65456733f236cff647046cad")
        ],
        'Electrónica Panamericana': [new ObjectId("667c275e9598122ba04071a2")],
        'SIN_CLIENT_ID_REACH': [
            new ObjectId("67982e5ee5255368918a716e"),
            new ObjectId("676c741714c91d1ab533ff4f"),
            new ObjectId("67ad25bca73e9ddc0ea85498")
        ],
        'TEST SMS': [new ObjectId("672180a5d5d31d82451bd3f9")],
        'CR': [new ObjectId("618da5173566842347555247")],
        'MOLVU': [new ObjectId("66da556880c24c2f809fc9a8")],
        'VANA': [new ObjectId("608cb279d9cfdc0b3c1cbde7")],
        'Olivate_GT': [new ObjectId("6397800b9e0144727c963053")],
        'REACHMART': [new ObjectId("5ededa32b0fd18358a6c96b9")],
        'PEDRO ROSALES': [new ObjectId("6435e96eaa293d699074aa10")],
        'IHI': [new ObjectId("63adf1640de9a46001e0afa4")],
        'MOVITEXT 30000694': [new ObjectId("61f47f4a9645ef0806eba014")]
    },
    'CA-GT': {
        'BANCO_GTC': [
            new ObjectId("63387269fd590b1df6d10e29"),
            new ObjectId("6345bf06c69aec223b43f98f"),
            new ObjectId("6345bf66c69aec223b43f992"),
            new ObjectId("6345bfbcc69aec223b43f995"),
            new ObjectId("635c07a6ec275d6a9ae12b7d"),
            new ObjectId("635c30b56913b561249a0960"),
            new ObjectId("63d2c95256edc968ec69bb43"),
            new ObjectId("63d2c98b550fcd68e64429b2"),
            new ObjectId("63d311c5550fcd68e6442a4a"),
            new ObjectId("63d4099d56edc968ec69bc17"),
            new ObjectId("63d4099e550fcd68e6442abc"),
            new ObjectId("63d40ad1550fcd68e6442ac8"),
            new ObjectId("63e42427c940851f46bbf7cb"),
            new ObjectId("63e42428a01f5f1f40a16ac5"),
            new ObjectId("63eeab1f2e1f517aa0c5b0d2"),
            new ObjectId("63eeab78bf50115cb324c8c9"),
            new ObjectId("640eb05e9b34385d9015c7d8"),
            new ObjectId("640eb38f9b34385d9015c800"),
            new ObjectId("640eb45c9b34385d9015c837"),
            new ObjectId("640eb4739b34385d9015c842"),
            new ObjectId("640eb4f59b34385d9015c879"),
            new ObjectId("650cc06bea9c833b9f2c9dd0"),
            new ObjectId("650cc65cd238e2cbd47b0280"),
            new ObjectId("650cc6d3ea9c833b9f2cb0f8"),
            new ObjectId("650cc8afea9c833b9f2cb38f"),
            new ObjectId("653ac5aed959292e992c51a9"),
            new ObjectId("653ae3ae4946b02e46e07d5e"),
            new ObjectId("653ae3b1d959292e992caf58"),
            new ObjectId("65401da24946b02e46e649a1"),
            new ObjectId("654023eb4946b02e46e65c9e"),
            new ObjectId("654024464946b02e46e65dfd"),
            new ObjectId("66f306cbb9e908047f88ca95"),
            new ObjectId("677699ef2683f4c457a9d232"),
            new ObjectId("67895c3ea37f43d8ffc46d51"),
            new ObjectId("67ae5722a1d1b381f3fa9021"),
            new ObjectId("67b3b0f3dbe3398e258df9ea"),
            new ObjectId("67b4d6a3a33e2e3f8651efc6"),
            new ObjectId("67c79951fa1f3b78c6cf47b1"),
            new ObjectId("67c799d539df9de8b72a68ca")
        ],
        'BANCO_INDUSTRIAL': [
            new ObjectId("634593c1c69aec223b43f987"),
            new ObjectId("650cd724ea9c833b9f2cd206"),
            new ObjectId("666ca27d9ca4430a4aeba4b7")
        ],
        'BANCO_CHN': [
            new ObjectId("65ef8f31f4d0debe1c0a1b41"),
            new ObjectId("65ef905289661252ec9d5dc7"),
            new ObjectId("67bf85a5e7592971dc0bb75a")
        ],
        'CLARO': [
            new ObjectId("63d40be7550fcd68e6442b0c"),
            new ObjectId("63d40cd7550fcd68e6442b5d"),
            new ObjectId("640f4ec59b34385d9015c8a6"),
            new ObjectId("66a27f5d99cd373726ee418b"),
            new ObjectId("6736219fb995cdd580e10d72")
        ],
        'SAT': [
            new ObjectId("632cd4592a5fc53bc9a9e9ca"),
            new ObjectId("632cdeca11b8e7148c8f5af8"),
            new ObjectId("632cdb7e11b8e7148c8f5aea"),
            new ObjectId("632cdfc411b8e7148c8f5b03"),
            new ObjectId("669ee753c3f9292415d20fc6"),
            new ObjectId("674a51bcde64e7e51f96f09b")
        ],
        'WALMART': [
            new ObjectId("640a7bba10c42214bc27a9a5"),
            new ObjectId("660ddd8889661252eccadd8c")
        ]
    },
    'CR': {
        'COINCA COMUNICACIONES INALAMBRICAS DE CENTROAMERICA': [new ObjectId("64066ba87382de1dc0f4a2d2")],
        'TEST SMS': [new ObjectId("6721823bbc40f34fd7f2d5d3")],
        'Claro Notifícame Plataforma OTPs': [new ObjectId("662a7b0dc7df7693fd41c9ba")],
        'HNG CARMENTA GLOBAL GROUP': [new ObjectId("64066c078b32971f9400144d")],
        'CREDISERVER SA': [new ObjectId("678591f8be4ce8dd94aa1667")],
        '64214711': [new ObjectId("65df5570657f393efaa2b998")],
        'CRUX CONSULTORES SOCIEDAD ANONIMA': [new ObjectId("64066b1a8b32971f940013aa")],
        'RECAUDADORA MAYA SOCIEDAD ANONIMA': [new ObjectId("63c86d9bf64da32de1f3b916")],
        'WIZTECH HOLDINGS SOCIEDAD ANONIMA': [new ObjectId("6720f457bc40f34fd7f0f95c")],
        'TELEDOLAR S. A.': [new ObjectId("64066cd08b32971f9400147f")],
        '2828745': [new ObjectId("6792b57075f752ea3aa95b88")],
        'KINETOS SOCIEDAD ANONIMA': [new ObjectId("6350cdb9f64da32de1f3b692")],
        'Claro  -  Call Center': [new ObjectId("6375585cea99312ea84f1493")],
        'NETCOM BUSSINES CONTACT CENTER SOCIEDAD ANONIMA 4186': [new ObjectId("63c80b1eea99312ea84f163d")],
        'BANCO IMPROSA S.A': [new ObjectId("645d3896168a33064339f159")],
        'ADT_Ventas': [new ObjectId("661195c7813a7028b4a4e754")],
        'ALUDEL ILIMITADA 1': [new ObjectId("6328aff0179b256c4f50c884")],
        'Tigo_Ventas': [new ObjectId("63e116a2918a96499bb59aec")],
        'Celltracker S.A': [new ObjectId("64066b7c8b32971f940013fb")],
        'DIGITAL SAT SOCIEDAD ANONIMA': [new ObjectId("674898a53fa2a30738d1fbfb")],
        'PCPURIS SOCIEDAD ANONIMA': [new ObjectId("64066c378b32971f94001476")],
        'CAMPOSANTOS LA PIEDAD S. A.': [new ObjectId("650a0d7d0b3c539c9749e8ee")],
        'ISTMO CENTER SOCIEDAD ANONIMA': [new ObjectId("6334af5c179b256c4f50c896")],
        'GESTIONADORA INTERNACIONAL SERVICREDITO SOCIEDAD ANONIMA': [new ObjectId("64066e178b32971f940014b7")],
        'NETCOM BUSINESS CONTACT CENTER SOCIEDAD ANONIMA': [new ObjectId("63c80b05ea99312ea84f1635")],
        'CONEXION COMERCIAL MOVIL LATAM SOCIEDAD ANONIMA': [new ObjectId("6672e09825600fddbfd3ef2b")],
        '3002231432': [new ObjectId("65f9fcda813a7028b496b8d6")],
        'GRUPO CORPORATIVO CRS SOCIEDAD DE RESPONSABILIDAD LIMITADA': [new ObjectId("64066cf38b32971f94001483")],
        'BANCO DAVIVIENDA (COSTA RICA) SA': [new ObjectId("646bf5fd168a33064339f200")],
        'FINANCIERA GENTE SOCIEDAD ANONIMA': [new ObjectId("640669dc8b32971f94001381")],
        'ALUDEL LIMITADA': [new ObjectId("658de3e2f4b766647031340f")],
        'SEA Servicios Múltiples de Costa Rica S.A.': [new ObjectId("645d3842168a33064339f140")],
        'QUÁLITAS COMPAÑÍA DE SEGUROS': [new ObjectId("64066b2e8b32971f940013b0")],
        'Banco Nacional': [new ObjectId("66266fae489cfd400d799728")],
        'CELL TECH SOLUTIONS': [new ObjectId("64ed169e6ffebb8169d7c463")],
        'Cesar Eduardo Quiros Monge': [new ObjectId("65b19873cab80b56b6437318")],
        'TBX SOCIEDAD DE RESPONSABILIDAD LIMITADA//GIANPPIER ESNEIDER PAREJA AVILA': [new ObjectId("65412b79a2b8f615972b9563")],
        'AMERICA SERVICE & SOLUTIONS SA - CLARO': [new ObjectId("64066b538b32971f940013e1")],
        'DPCR FOODS SOCIEDAD ANONIMA': [new ObjectId("63503026ea99312ea84f135f")],
        'KHARPA SOCIEDAD AGENCIA DE SEGUROS S.A': [new ObjectId("65567cbe0a14d3a8582304e8")],
        'CONECTE DE COSTA RICA SOCIEDAD ANONIMA': [new ObjectId("672aa048f052f5632c3e6263")],
        'Navegalo': [new ObjectId("65e88303813a7028b47c2b13")],
        'COOPERATIVA DE SERVICIOS MULTIPLES DE MAESTROS PROFESORES PENSIONADOS': [new ObjectId("63c6f135ea99312ea84f1620")],
        'MOVIL TECH SUPPLY INC S.A': [new ObjectId("641e2c217382de1dc0f4a473")],
        'American Data Networks S.A': [new ObjectId("652826cd772514062baccf3f")],
        'KOOLMOVIL SOCIEDAD ANONIMA': [new ObjectId("64d40278710f7ac1af3e85c4")],
        'Cuenta DEMO CR': [new ObjectId("631920ad70a11320238d7fdb")],
        'FINANCIERA DESYFIN S. A.': [new ObjectId("66103c74813a7028b4a3da22")],
        'RS SOCIEDAD ANONIMA': [new ObjectId("66e5b2a5b0adfb70ddff31de")],
        'TE CONTACTO CONTACT CENTER S.A': [new ObjectId("6720f456bc40f34fd7f0f949")],
        'ZIMPLIFICA SOCIEDAD ANONIMA': [new ObjectId("66676cca736c1e7144174e85")],
        'CONSULT - IT SOCIEDAD ANONIMA': [new ObjectId("645d382f168a33064339f13a")],
        'ASEGURADORA DEL ISTMO ( ADISA ) SOCIEDAD ANONIMA': [new ObjectId("63c6eeb1ea99312ea84f15b3")],
        'Mercadeo Credix': [new ObjectId("66aade6ad747e4d7daba10c0")],
        'Sandra Patricia Meza Dall Anese': [new ObjectId("64066b8c7382de1dc0f4a2cd")],
        'Canton H K Central de Alimentos S.R.L': [new ObjectId("65d5355b657f393efa9b2431")],
        'BARMENTECH SRL': [new ObjectId("651f30c32f0dbc58f8de19b0")],
        'PIZZA HUT 2': [new ObjectId("63503949f64da32de1f3b5c5")],
        'SOLUCIONES INFORMATICAS INTERNACIONALES S.A': [new ObjectId("645d3859cef2cc0649c32da0")],
        'PRUEBAS MERCADEO SEGMENTO CORP': [new ObjectId("66d5f4d984f7c2feb7b8eb77")],
        'Liberty Cobros': [new ObjectId("660b35324ce9c22be5e79f0f")],
        'prod-payment-processor Wink': [new ObjectId("65cd31240a1c3f098d0f855b")],
        'Mercadeo CSF': [new ObjectId("645eb69ecef2cc0649c32e0d")],
        'ARABELA': [new ObjectId("6359dc14ea99312ea84f1460")],
        'LABIN': [new ObjectId("645ebd04168a33064339f19b")],
        'DPS': [new ObjectId("645d575c168a33064339f166")],
        'CREDECOOP': [new ObjectId("645d5734168a33064339f160")],
        'YAWASKA SOCIEDAD DE RESPONSABILIDAD LIMITADA': [new ObjectId("6745e45c3fa2a30738cd2b0a")],
        'PROMESAS CLARO': [new ObjectId("64adb2b0cdfb4ff2c1bd1cf8")],
        'Credix Automáticos': [new ObjectId("672b9f258b495637b5465250")],
        'KrediYa_Ventas': [new ObjectId("65dccaf50a1c3f098d1a37e5")],
        'ISS Consultores': [new ObjectId("64ff2a0b619f0a1631503886")],
        'LA OPERA': [new ObjectId("64b54509c4a232155cb720b1")],
        'Grupo CS': [new ObjectId("65455a97a2b8f615973214d8")],
        'PRUEBAS SAC': [new ObjectId("65e1e0f14ce9c22be5c8638a")],
        'BANCO DAVIVIENDA (COSTA RICA) S.A.': [new ObjectId("65f37942813a7028b48b1a2d")],
        'MEDISMART': [new ObjectId("64066c158b32971f94001465")],
        'RESUELVA SOCIEDAD ANONIMA': [new ObjectId("67ad19d0d78257b97450b652")],
        'PARTIDO UNIDAD SOCIAL CRISTIANA': [new ObjectId("6350943fea99312ea84f1389")],
        'COOPENAE RL Wink': [new ObjectId("657734916e4dfc3c452285ba")],
        'FOUNDEVER COSTA RICA S. A.': [new ObjectId("656ddcc554891165bf35bb93")],
        'IMPORTACIONES MARZU SOCIEDAD ANONIMA': [new ObjectId("63c6f085f64da32de1f3b875")],
        'SALUDAUNCLIC SOCIEDAD ANONIMA': [new ObjectId("645c3614168a33064339f114")],
        'MSAGE LATAM EMPRESA INDIVIDUAL DE RESPONSABILIDAD LIMITADA': [new ObjectId("640669a97382de1dc0f4a217")],
        'TICABOX EXPRESS S.A.': [new ObjectId("655e79d554891165bf2a0db7")],
        'Coopecredit': [new ObjectId("6658cfb208e3b9695b0b28a8")],
        'BALIO CONSULTING SERVICES S.A.': [new ObjectId("63c86cb4f64da32de1f3b8fc")],
        'TIgo_Cobros': [new ObjectId("63e28b4a9000780fa53ba38b")],
        'Optica Jimenez': [new ObjectId("67a3c597f07c7d378d2636e5")],
        'GESTIONADORA DE CREDITOS DE SJ S.A': [new ObjectId("64e7da43710f7ac1af4c3bc0")],
        'dev-notifications Wink': [new ObjectId("65cd3013657f393efa958b93")],
        'dev-payment-processor Wink': [new ObjectId("65cd30620a1c3f098d0f7d86")],
        'stg-payment-processor Wink': [new ObjectId("65cd30b6657f393efa958ce0")],
        'ARKKOSOFT SOCIEDAD ANONIMA': [new ObjectId("646391e3cef2cc0649c32e38")],
        'LTI': [new ObjectId("66999d90313b33c6a9966340")],
        'ARTIFEX CONSULTING SOCIEDAD ANONIMA': [new ObjectId("667eda1258ec4870271171f7")],
        'Artelec_Cobros': [new ObjectId("65dcbd2f657f393efaa020f4")],
        'CARLOS GUILLEN RUIZ': [new ObjectId("64066b707382de1dc0f4a2a9")],
        'Instituto de Formacion Aeronautica': [new ObjectId("63c86ccdea99312ea84f1673")],
        'stg-notifications Wink': [new ObjectId("65cd3090657f393efa958c99")],
        'COOPERATIVA DE AHORRO Y CREDITO DE SAN MARCOS DE TARRAZU DE RESPONSABILIDAD LIMITADA': [new ObjectId("64066c4c7382de1dc0f4a360")],
        'COOPENAE RL - Principal': [new ObjectId("636ed66ef64da32de1f3b716")],
        'AEROCASILLAS SA': [new ObjectId("64066bb58b32971f9400142c")],
        'DEMO NAVEGALO': [new ObjectId("67d991d6cf0df74d7780a629")],
        'PAY TECH SOLUTIONS': [new ObjectId("6350b8abf64da32de1f3b638")],
        'RIDIVI S. A.': [new ObjectId("62d17fd4a7bf454ebad53662")],
        'JDS GESTION DINAMICA S. A.': [new ObjectId("63c6f110f64da32de1f3b88b")],
        'ASOCIACION COSTARRICENSE DE MOVILIDAD ELECTRICA': [new ObjectId("64c278feafcce4f664461a4f")],
        'GRUPO INTERFAZ': [new ObjectId("64baafc3d5535d814b5fed61")],
        'Credix': [new ObjectId("6553a4480a14d3a8581fd61a")],
        'CIDGALLUP': [new ObjectId("6621335f489cfd400d7276d3")],
        'Tips CR': [new ObjectId("65120fe1772514062b9909d9")]
    },
    'CA-HN': {
        'CRECE RECOVERY': [
            new ObjectId("6725447208868f967a083482"),
            new ObjectId("672a68b3dac65b1595d6f63e"),
            new ObjectId("672a6965dac65b1595d6f6ea"),
            new ObjectId("672a693906015bbedd915ba5"),
            new ObjectId("672a69d606015bbedd915c5b"),
            new ObjectId("672a68f8dac65b1595d6f674"),
            new ObjectId("672a698adac65b1595d6f717"),
            new ObjectId("672a69b6dac65b1595d6f750"),
            new ObjectId("672a6a1206015bbedd915c8c"),
            new ObjectId("672a6884dac65b1595d6f619")
        ],
        'ALMACENES LADY LEE': [
            new ObjectId("676dce7de83b6fa3f743f8d9"),
            new ObjectId("676dce7de83b6fa3f743f8f6"),
            new ObjectId("676dcfb4e83b6fa3f743fa20")
        ],
        'CLARO': [
            new ObjectId("636c19118ef21d63e33449e3"),
            new ObjectId("66abb5e4b5a59b05425cca18"),
            new ObjectId("66b50285b5a59b05425e8a55"),
            new ObjectId("635c911d8ef21d63e33449a4"),
            new ObjectId("63bf01061b99644268c97838"),
            new ObjectId("63bf01061b99644268c97838")
        ],
        'DEMO/PRUEBAS': [
            new ObjectId("6650c378baa34cf8124f2d9d"),
            new ObjectId("65afe2af20cba999e462d5f4"),
            new ObjectId("62cce00ff9c060790a120392"),
            new ObjectId("670d4cb2edc771464b777af2"),
            new ObjectId("66f6d36250d3f0e54602453a"),
            new ObjectId("67201f24a28bef6d988c18b0"),
            new ObjectId("66ea111a1eac482cdf264d88"),
            new ObjectId("677d8737c257ab9bf09e19e0"),
            new ObjectId("679ce3d4be790099a24061aa"),
            new ObjectId("65272827f91242f38f448268")
        ],
        'INSTITUTO DE PREVENCION MILITAR': [
            new ObjectId("660434cbe30625d562c1f29e"),
            new ObjectId("65cfd6c0019215053aac3332"),
            new ObjectId("63f92d18d1dab214420af1cc")
        ],
        'COMPI TECHNOLOGIES': [
            new ObjectId("6685a28b7df515d1adb7c052"),
            new ObjectId("667c94bfbd8698ec0c9b87d6"),
            new ObjectId("65734e854be54af8a793608e"),
            new ObjectId("658346b020cba999e45b4173")
        ],
        'MASTER TECHNOLOGY': [
            new ObjectId("662fdef7c0474a1e0238adbb"),
            new ObjectId("65dd10f3019215053aad60f4"),
            new ObjectId("66451d70523b29f856e7700a")
        ],
        'MULTICABLE': [
            new ObjectId("664bdff49b68c459b8bb1357"),
            new ObjectId("669af8535a409baed0a43378")
        ],
        'CONTROL POINTS': {
            'CH': [
                new ObjectId("66c3c765b5a59b0542611204"),
                new ObjectId("66c504a0b5a59b0542619543"),
                new ObjectId("66c504efb5a59b054261959e"),
                new ObjectId("66c50531b5a59b0542619627"),
                new ObjectId("66ccaeec5a409baed0addd77"),
                new ObjectId("66c505c85a409baed0ac1c94"),
                new ObjectId("66c5057b5a409baed0ac1c0d")
            ],
            'PTO': [
                new ObjectId("66d34c206b69c64821fef13a"),
                new ObjectId("66d34dc96b69c64821fef226"),
                new ObjectId("66d34e089fc0da5eb6718c3f"),
                new ObjectId("66d34e3d6b69c64821fef2bd"),
                new ObjectId("66d34e656b69c64821fef30e"),
                new ObjectId("66d34e8f9fc0da5eb6718cf3"),
                new ObjectId("66d34eb49fc0da5eb6718d3e"),
                new ObjectId("66d34ed86b69c64821fef3bc"),
                new ObjectId("66d34f036b69c64821fef3fb")
            ],
            'SPS': [
                new ObjectId("67293f4c5d35e41a6a2aac85"),
                new ObjectId("67293fae9ee746f2bfc63454"),
                new ObjectId("67293ff79ee746f2bfc6348e"),
                new ObjectId("6729401b9ee746f2bfc634de"),
                new ObjectId("672940365d35e41a6a2aad7a"),
                new ObjectId("672940615d35e41a6a2aadc4")
            ]
        },
        'FICOHSA': [
            new ObjectId("6791688a036fa1a899cade43"),
            new ObjectId("6746514292128db93a0cae77"),
            new ObjectId("65d53ec56ff6ed4b6dc1cf32"),
            new ObjectId("64e6991e2d22c98d065e45f3"),
            new ObjectId("644c40d9ea6128719eb8d99b")
        ],
        'BANCO_ATLANTIDA': [
            new ObjectId("64e6991e2d22c98d065e45f3"),
            new ObjectId("644c40d9ea6128719eb8d99b")
        ],
        'IMPORTADORA DE VEHICULOS': [
            new ObjectId("6716d8491709c06b18f91437"),
            new ObjectId("63f79707f1575365d26951d0")
        ],
        'PLAN TRIFINIO': [
            new ObjectId("673e39b5f56af4766610f54d"),
            new ObjectId("6765d3cfb00509d5da1643df")
        ],
        'MENDELS': [
            new ObjectId("63742146480e14638fe366c0"),
            new ObjectId("637506c6480e14638fe366d3"),
            new ObjectId("665a0c36baa34cf812508c1d"),
            new ObjectId("637507868ef21d63e3344a21")
        ],
        'DIDAC FOODS': [new ObjectId("673e1b3ff56af4766610d56f")],
        'VIVA_TRAVEL': [new ObjectId("63bf025c44cc9642805a10c6")],
        'LA CASA DEL SOLDADOR': [new ObjectId("67250c86725d997798f0ab9e")],
        'KOLEKTO': [new ObjectId("65fdfd49f3f8c844d80d5773")],
        'BEONTOUR S DE RL DE CV': [new ObjectId("658db7a520cba999e45d4984")],
        'MOLINEROS COMERCIAL': [new ObjectId("64791d0bb4f10a6ab17dac95")],
        'FINNINVESTO': [new ObjectId("6675f26cbd8698ec0c9a604d")],
        'OUTSOURCING PARTNER': [new ObjectId("6719337e03df334188f36166")],
        'CARGO EXPRESO': [new ObjectId("6765a8e09174f05516fb5d30")],
        'SALINAS ASOCIADOS': [new ObjectId("65fe07e4f3f8c844d80d5d57")],
        'AMOR ETERNO': [new ObjectId("655254e129a2e6afc12608dc")],
        'CARIBBEAN APPETIZERS': [new ObjectId("669549a5b24b94776ffa488d")],
        'INNOVA BPO': [new ObjectId("663b93a0d094b8abc85861ae")],
        'ASSA SEGUROS HONDURAS': [new ObjectId("6568993d0fb99e15487dba6e")],
        'WALMART-HN': [new ObjectId("667dd87d7df515d1adb6e498")],
        'DAVIVIENDA': [new ObjectId("63f92ddaf1575365d2695224")],
        'ULTRANET': [new ObjectId("63f92ce2d1dab214420af1c7")],
        'PRESTO_CASH': [new ObjectId("64c831a2451faf03b13e93e3")],
        'DUAL TECHNOLOGY SERVICES': [new ObjectId("6531648bc5ad0175f55dda98")],
        'FUNDACION PARA EL DESARROLLO DE LA VIVIENDA': [new ObjectId("63bf043844cc9642805a116b")],
        'PROCESADORA DE TARJETAS DE CREDITO': [new ObjectId("63f92e60d1dab214420af1ff")],
        'SEGURIDAD HONDURAS CANADA': [new ObjectId("6453ccebb4f10a6ab17dabce")],
        'OLA CREDIT': [new ObjectId("65faf883f3f8c844d80c9db7")],
        'PROGRAMA DE NACIONES UNIDAS PARA EL DESARROLLO': [new ObjectId("67c77dbea8bf1e2ba218e745")],
        'FARMACIA SIMAN': [new ObjectId("679be51fbe790099a240263d")],
        'TREADWAY INTERNATIONAL': [new ObjectId("63f92d6ed1dab214420af1df")],
        'FICOHSA': [new ObjectId("67c9dd9024efbdd9c35b6ed0")],
        'FUNDACION AMIGOS DEL HOSPITAL MARIA': [new ObjectId("63bdc55444cc9642805a0fad")],
        'COORDINACION PARTIDO NACIONAL': [new ObjectId("67ad3bb6c59be9402a1225fd")],
        'MULTISERVICIOS MIRIAM': [new ObjectId("6706a5a6d6d27b071c5b875a")],
        'INST NAC JUBILACIONES': [new ObjectId("67ad23adc59be9402a121727"),
            new ObjectId("67a0dc6fbe790099a24100aa")
        ],
        'HABITAT PARA LA HUMANIDAD HONDURAS': [new ObjectId("63bf03d61b99644268c979b2")],
        'DETEKTOR': [new ObjectId("6359d822480e14638fe364e5")],
        'ODEFF': [new ObjectId("67a69f51c59be9402a10b63f")],
        'MOTOS Y VEHICULOS MOVESA': [new ObjectId("66b14cfab5a59b05425d9bc2")],
        'INNOVA': [new ObjectId("63bf024f1b99644268c97945")],
        'ESTIBADORES Y REPARACIONES INDUSTRIALES': [new ObjectId("679d536b04fce75a6174fc59")],
        'CLARO OTPS': [new ObjectId("673623b577f81948ef5dfc7c")],
        'CCH-04': [new ObjectId("66c50531b5a59b0542619627")],
        'HONDURAS AMERICAN TABACO': [new ObjectId("649c475c7eae172d189192b7")],
        

    },
    'CA-NI': {
        'CLARO': {
            'MAIN': [
                new ObjectId("6798ff0898c80319f3d1ac41"),
                new ObjectId("670825db31e672a1d4864b38"),
                new ObjectId("6708250731e672a1d4864aa6"),
                new ObjectId("66fd6806b896a76e9af031b2"),
                new ObjectId("676d6d049ef042fa56ffcc26"),
                new ObjectId("6708263e31e672a1d4864bbc"),
                new ObjectId("670823f3dccb4a651545cb3d"),
                new ObjectId("6708222cdccb4a651545c923"),
                new ObjectId("670822bf31e672a1d486482b"),
                new ObjectId("6708246d31e672a1d4864a66"),
                new ObjectId("67082c78880ffe8ef934ffe2"),
                new ObjectId("6733a2f220f4c60f177056f4"),
                new ObjectId("6359dc8d7126995820d63743")
            ],
            'EMPRESAS': [
                new ObjectId("6470bfb9157764780d84c8bc"),
                new ObjectId("6470c09e157764780d84c8bf")
            ],
            'OTROS': {
                'NICARAGUA': [new ObjectId("6470cbe0157764780d84c8d0")],
                'NOTIFICAME_OTPS': [new ObjectId("62ccb046e02edc18e8363a2b")],
                'RECURSOS_HUMANOS': [new ObjectId("633c491107ca8f3b4cd1d2cf")],
                'ROAMING': [new ObjectId("67082941880ffe8ef934fc9a")]
            }
        },
        'PRUEBAS': [
            new ObjectId("668c79939013a9ff1c9da498"),
            new ObjectId("668c73fe313dfec531cdf7ff"),
            new ObjectId("672183a2eead61c57ad940b5"),
            new ObjectId("6790050565a71a2d72dd7298")
        ],
        'VSR DE NICARAGUA': [
            new ObjectId("633c534807ca8f3b4cd1d2de")
        ],
        'TRACKLINK': [
            new ObjectId("63eeb155d14c75633bcb9179")
        ],
        'DISTRIBUIDORA DE ELECTRICIDAD DEL NORTE': [
            new ObjectId("655e7336111e53caecd0c5b4")
        ],
        'UNION DE COOPERATIVA AGROPECUARIA RL': [
            new ObjectId("6380d7f5071e8c20cbd2adcd")
        ],
        'SEGUROS AMERICA': [
            new ObjectId("6359ae2bf0d1fb58042346a3")
        ],
        'INISER': [
            new ObjectId("6359dcc87126995820d63748")
        ],
        'WALMART': [
            new ObjectId("65aaf8ef57214461fb53e440")
        ],
        'BANCO DE AMERICA CENTRAL': [
            new ObjectId("6359dd767126995820d63775")
        ],
        'MIFIC': [
            new ObjectId("6359a03d7126995820d63733")
        ],
        'INSTITUTO DE SEGURIDAD SOCIAL Y DESARROLLO': [
            new ObjectId("63eeb15ed14c75633bcb917e")
        ],
        'BIOANALISIS': [
            new ObjectId("63eeb12cd14c75633bcb9169")
        ],
        'DIRECCION GENERAL DE INGRESOS': [
            new ObjectId("63eeb140d14c75633bcb9170")
        ],
        'UAM': [
            new ObjectId("633c522307ca8f3b4cd1d2d5")
        ],
        'UNICEF': [
            new ObjectId("63eeb3297458ba6349afc7ba")
        ],
        'FARMACEUTICOS Y CONEXOS SA': [
            new ObjectId("633c52ec07ca8f3b4cd1d2db")
        ],
        'NUMERIC_IDS': {
            '12711574': [new ObjectId("67b791a584b4af9663fff305")]
        }
    },
    'CA-SV': {
        'BAC': [
            new ObjectId("674f5b7d95c015645ad0b309"),
            new ObjectId("674f5bc6fbb09a2ba3e78df3"),
            new ObjectId("641c84737c1a6012c0eecd57"),
            new ObjectId("641c83055cf7da12ce37ea84"),
            new ObjectId("641c816d5cf7da12ce37ea81"),
            new ObjectId("641c808c7c1a6012c0eecd3a"),
            new ObjectId("63d8345b2f473e5f2d7c8038")
        ],
        'DAVIVIENDA': [
            new ObjectId("65e9da18a8bc6d77d376dd58"),
            new ObjectId("65aaf0cfd716e1fbf7bd9dde"),
            new ObjectId("674f5cc695c015645ad0b42e"),
            new ObjectId("674f5c8a9c36deac182c2660"),
            new ObjectId("66e9bbdb006b98d4de03d33e"),
            new ObjectId("6627f6aa32957ebe7021cdb9"),
            new ObjectId("6626de7d32957ebe702198e8")
        ],
        'BFA': [
            new ObjectId("673df73ff5278abe30d1bc63"),
            new ObjectId("673df5fbef82077f342588d9"),
            new ObjectId("67780ddb01f134e9a48f1aec")
        ],
        'BANCO_INDUSTRIAL': [new ObjectId("65a6f5b19b4c9017224c25b6")],
        'BANCO_CUSCATLAN': [
            new ObjectId("6717f27ecdaf7f0db70fb099"),
            new ObjectId("674f5c5095c015645ad0b3c1")
        ],
        'PROMERICA': [
            new ObjectId("66d791ff46f3886b05d430aa"),
            new ObjectId("66bbee038e4b5ab9beb0cd66")
        ],
        'CAJA_CREDITO_CHALCHUAPA': [new ObjectId("63827fbdb6fe6a4eeea1715b")],
        'CAJA_CREDITO_SAN_MIGUEL': [new ObjectId("638281a9b6fe6a4eeea1716e")],
        'CAJA_CREDITO_ZACATECOLUCA': [new ObjectId("63822d8eb6fe6a4eeea170ed")],
        'CLARO': [
            new ObjectId("63836df605c6cd4ee6d7c443"),
            new ObjectId("62e86fafaba98d2f8fcf7cad"),
            new ObjectId("675c5d7601f134e9a48d6227"),
            new ObjectId("63891c7b006e215d8e67ad14"),
            new ObjectId("6736290bad41e917e0f3bfa3"),
            new ObjectId("671c058fab10390abdd0ec4d")
        ],
        'MAPFRE': [new ObjectId("638e5c37ec4f9f6e629a1a22")],
        'CNR': [
            new ObjectId("661e9365412afb3e262e3be3"),
            new ObjectId("661e9290412afb3e262e3af9"),
            new ObjectId("661e922532957ebe701f8dcd"),
            new ObjectId("661e916932957ebe701f8cf3"),
            new ObjectId("631253ac48862a66c201570c"),
            new ObjectId("63125365c7b27466b4d5b32b"),
            new ObjectId("63125312c7b27466b4d5b328")
        ],
        'DETEKTOR EL SALVADOR': [new ObjectId("63f8fae27c1a6012c0eeccc7")],
        'ZETA GAS': [new ObjectId("63f8faba5cf7da12ce37e9b7")],
        'GLOBAL PAY SOLUTIONS': [new ObjectId("645427415cf7da12ce37eb83")],
        'AC DE RL SEGUROS FUTURO': [new ObjectId("6359d9b1122c24388768d7e6")],
        'GOLAN': [
            new ObjectId("63f8fac67c1a6012c0eeccad"),
            new ObjectId("63f8facf7c1a6012c0eeccb2")
        ],
        'WALMART': [new ObjectId("65aaf5d3d716e1fbf7bda818")],
        'AL FORNO': [new ObjectId("632cb33d56f7eb3e07cc7295")],
        'SHERWIN WILLIAMS': [new ObjectId("63063ba09e93f15e416acc06")],
        'CEMENTERIO DE LA RESURRECCION': [new ObjectId("63a608f8ec4f9f6e629a1a65")],
        'JOSE N.BATARSE': [new ObjectId("64c3ef43e83e20914b96e354")],
        'CREDIOPCIONES': [new ObjectId("6382850205c6cd4ee6d7c42e")],
        'PBS EL SALVADOR': [new ObjectId("6530668dfa1b206c2bc604f0")],
        'DIRECCION DE REGISTRO DE COMERCIO': [new ObjectId("62dac307efdf50738340e0ef")],
        'CTE': [new ObjectId("6321dac9a8f0035cffbd3a07")],
        'IVAN': [new ObjectId("638284c805c6cd4ee6d7c423")],
        'GRUPO PREMIUM': [new ObjectId("67cb7462334817662463faa3")],
    },
    'CARG': {
        'GMG': [
            new ObjectId("674a5b0f4e978450a7574b70"),
            new ObjectId("674a5a8b4e978450a7574b3e"),
            new ObjectId("674a59d8963c00f37126507c"),
            new ObjectId("674a59264e978450a7574ad0"),
            new ObjectId("674a589b110e7d95f24d7de8"),
            new ObjectId("674a574b4e978450a7574a75"),
            new ObjectId("674a55ea4e978450a7574953"),
            new ObjectId("674a54e5bc58ce6c0ee29634")
        ],
        'WALMART': [
            new ObjectId("668dbce4ce9a4ef30c587be4"),
            new ObjectId("66983aface9a4ef30c588825"),
            new ObjectId("668817f89d05a3d825e425cd"),
            new ObjectId("6689b034b9a29ba62cbda35d")
        ],
        'DEMO_REGIONAL': [
            new ObjectId("66ae7d18ce9a4ef30c58b755"),
            new ObjectId("66ae6bd4ce9a4ef30c58b14f"),
            new ObjectId("66ae5572ce9a4ef30c58ae46"),
            new ObjectId("66ae5506ce9a4ef30c58ae10"),
            new ObjectId("66ae49d482b0b83610ba1e5c")
        ],
        'ALFA_NOT': [
            new ObjectId("66b57e2dce9a4ef30c5900ec"),
            new ObjectId("66b5792782b0b83610ba6ecd"),
            new ObjectId("66b5747ece9a4ef30c58f823"),
            new ObjectId("66b564e2ce9a4ef30c58e764"),
            new ObjectId("66b56cf1ce9a4ef30c58eb3f")
        ]
    },
    'TIGO_HN': {
        'FICOHSA': [
            new ObjectId("64791ffa8307d83a0ff1ff19"),
            new ObjectId("5f485893eaf5b15700825576"),
            new ObjectId("5f4858c7eaf5b15700825583"),
            new ObjectId("61008db7da95e948d84e2ee3"),
            new ObjectId("5f485629eaf5b15700825565")
        ],
        'DAVIVIENDA': [
            new ObjectId("64791ffa8307d83a0ff1ff19"),
            new ObjectId("5f485893eaf5b15700825576"),
            new ObjectId("5f4858c7eaf5b15700825583")
        ],
        'BANPAIS': [
            new ObjectId("64b5cb55a147a6c802f7c95d"),
            new ObjectId("6308f2d30c68fe76d9885b4b"),
            new ObjectId("6532fbb832a1a866b3b37495"),
            new ObjectId("669a7e54711e25d644aeb8c1")
        ],
        'BANRURAL': [new ObjectId("6737d2569489f30977b30628")],
        'BANCO_AZTECA': [new ObjectId("63f3f7fa5e66b83a1505ccdc")],
        'BANCO_CUSCATLAN': [new ObjectId("65734829e9e60fa961015bf7")],
        'COOPERATIVA_SANMARQUENA': [
            new ObjectId("63e550e18307d83a0ff1fb2a"),
            new ObjectId("63e5504f5e66b83a1505cb8e"),
            new ObjectId("6329f10405634220f0e12244")
        ],
        'COOPERATIVA_CHOROTEGA': [new ObjectId("660f14bd1592f46d192df5ba")],
        'COACEHL': [
            new ObjectId("627ee3bba1c33840a7e1f078"),
            new ObjectId("65b40ffcf57f9578578f594b")
        ],
        'COOPERATIVA_APAGUIZ': [new ObjectId("63e550bc5e66b83a1505cc25")],
        'COOPERATIVA_CEIBEÑA': [new ObjectId("663a82a651cf8788a51eb74b")],
        'COOPERATIVA_PESPIRENSE': [new ObjectId("660df53b2098e12c61696c13")],
        'TIGO_BUSINESS': [
            new ObjectId("62f17a058e5486095be4dceb"),
            new ObjectId("60ca7f92724bd331089b8ef1")
        ],
        'TIGO_DEMO': [
            new ObjectId("63223d24b0b2f520ea58d0a4"),
            new ObjectId("647f56538307d83a0ff1ff3a"),
            new ObjectId("62fea1b10c68fe76d9885b18"),
            new ObjectId("5eea3ad7a98a29151b82d8c0")
        ],
        'SEGUROS_BOLIVAR': [
            new ObjectId("61a509cbde169823ceba06cc"),
            new ObjectId("61a50a23de169823ceba06ed"),
            new ObjectId("61a5078230bb2b597de8774c")
        ],
        'SEGUROS_CREFISA': [new ObjectId("63f8f5a58307d83a0ff1fc2e")],
        'LADY_LEE': [
            new ObjectId("61c0db0dad5c471f9a79dff7"),
            new ObjectId("61c0d7b3ad5c471f9a79dfa3")
        ],
        'WALMART': [new ObjectId("668817f89d05a3d825e425cd")],
        'EMPIRE': [new ObjectId("63e550c58307d83a0ff1fb15")],
        'FARMACIAS_AHORRO': [new ObjectId("625da13b3467136124b13542")],
        'ENEE': [new ObjectId("64f8eb5f0e83678032ae7c13")],
        'AGUAS_SAN_PEDRO': [new ObjectId("62991f5fe85ab9787e502a50")],
        'AMDC': [
            new ObjectId("6716b9652edb8995683c52a7"),
            new ObjectId("661ee437d8c12718097e7cc2"),
            new ObjectId("667c1db33b063e1cfe593e0a")
        ],
        'SANDBOX': [
            new ObjectId("66abfe5ead9cc5899d12f78b"),
            new ObjectId("64dceafbbdf68bdb365ce981"),
            new ObjectId("64ee51e42d22c98d0664e301")
        ],
        'ARGOS': [new ObjectId("6347134c5547647950b1acdd")],
        'UNIMERC': [new ObjectId("63e54fd65e66b83a1505cb86")],
        'MOVITEX': [
            new ObjectId("613bed6bd99afc2a38dfbe14"),
            new ObjectId("613bee194463a82a32895dfc")
        ],
        'CREDIMOTOR': [
            new ObjectId("667b69051780232e6773a8a1"),
            new ObjectId("666b1fdcb78c4c0d53ea4c66")
        ]
    },
    'REGIONAL': {
'GMG': [
    new ObjectId("66f3336cdbdae576e9e1bd7d"), // GTS-Cobros
    new ObjectId("675203781a5ed3608a9ef8be"), // GTS-ADQ
    new ObjectId("679d74239ba4542fc4b5336d"), // HNS-CobrosAdmin
    new ObjectId("679d7449535418f79ca797ef"), // HNS-CobrosRecovery
    new ObjectId("66e9e357aa568fd25635bc0f"), // SVS-Cobros
    new ObjectId("674a5b0f4e978450a7574b70"), // CRC-Flormar
    new ObjectId("66f3319bdbdae576e9e1bcd3"), // GTC-Gallo
    new ObjectId("674a54e5bc58ce6c0ee29634"), // CRC-Monge
    new ObjectId("679d75539ba4542fc4b5380f"), // HNC-Apoyo
    new ObjectId("679d731a535418f79ca793aa"), // HNC-(Gallo-Serpento)
    new ObjectId("66e9e44aaa568fd25635bc84"), // SVC-Prado
    new ObjectId("673513129fce23b0dc0892f7"), // SVC-Prado Alfa
    new ObjectId("679d72a8535418f79ca79321"), // HNS-(Cash-FlexiCard)
    new ObjectId("66f332d5dbdae576e9e1bd14"), // GTC-Serpento
    new ObjectId("674a55ea4e978450a7574953"), // CRC-Verdugo

    // Nuevos agregados:
    new ObjectId("674a59264e978450a7574ad0"), // CRF-Credito
    new ObjectId("674a589b110e7d95f24d7de8"), // CRF-ADQ
    new ObjectId("674a59d8963c00f37126507c"), // CRF-Monge Emprendedor
    new ObjectId("674a5a8b4e978450a7574b3e"), // CRF-Cobros
    new ObjectId("674a574b4e978450a7574a75")  // CRF-TarjetaMonje
],
        'WALMART': [
            new ObjectId("668dbce4ce9a4ef30c587be4"),
            new ObjectId("66983aface9a4ef30c588825"),
            new ObjectId("668817f89d05a3d825e425cd"),
            new ObjectId("6689b034b9a29ba62cbda35d")
        ],
        'DEMO_REGIONAL': [
            new ObjectId("66ae7d18ce9a4ef30c58b755"),
            new ObjectId("66ae6bd4ce9a4ef30c58b14f"),
            new ObjectId("66ae5572ce9a4ef30c58ae46"),
            new ObjectId("66ae5506ce9a4ef30c58ae10"),
            new ObjectId("66ae49d482b0b83610ba1e5c")
        ]
    }
};

async function updateClientIds(instanceConfig, mappings) {
    const uri = `mongodb://${instanceConfig.host}:27017`;
    const client = await MongoClient.connect(uri, { readPreference: 'secondary' });
    
    try {
        console.log(`\nConectando a ${instanceConfig.name} en ${instanceConfig.host}`);
        const db = client.db(instanceConfig.database);
        const collection = db.collection(instanceConfig.collection);

        const instanceMappings = mappings[instanceConfig.name];
        if (!instanceMappings) {
            console.log(`No hay mappings definidos para ${instanceConfig.name}`);
            return;
        }

        for (const [clientId, accountUids] of Object.entries(instanceMappings)) {
            if (!Array.isArray(accountUids) || accountUids.length === 0) {
                console.log(`Saltando ${clientId} porque no tiene UIDs válidos`);
                continue;
            }

            try {
                const result = await collection.updateMany(
                    { account_uid: { $in: accountUids } },
                    { $set: { client_id: clientId } }
                );
                console.log(`${instanceConfig.name} - ${clientId}: ${result.modifiedCount} documentos actualizados`);
            } catch (error) {
                console.error(`Error actualizando ${clientId} para ${instanceConfig.name}:`, error);
            }
        }
    } finally {
        await client.close();
    }
}

async function main() {
    for (const instance of instances) {
        if (accountMappings[instance.name]) {
            console.log(`\nProcesando instancia: ${instance.name}`);
            await updateClientIds(instance, accountMappings);
        }
    }
    console.log('\n¡Proceso de actualización completado!');
}

main().catch(console.error); 