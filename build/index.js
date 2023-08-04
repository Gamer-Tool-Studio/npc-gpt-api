/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 284:
/*!************************************************!*\
  !*** ./src/app-middleware/apiAuthenticator.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\nconst { Router } = __webpack_require__(/*! express */ 860);\nconst { logDebug } = (__webpack_require__(/*! src/core-services/logFunctionFactory */ 268).getLogger)(\"requestCalls\");\n// const challenges = require(\"$services/challenges\");\n/**\n * Routes that uses authentications\n */\nconst authRoutes = [\"/api/v1/auth/gen-auth\"];\nconst signValidatorHandler = async function (req, response, next) {\n    logDebug(\"API AUTHENTICATOR\\n\", \"URL : \", req.originalUrl, \" METHOD \", req.method);\n    const calledUrl = req.originalUrl.split(\"?\")[0];\n    logDebug(\"called url \", calledUrl);\n    if (authRoutes.includes(calledUrl)) {\n        try {\n            const authToken = req.header(\"Authorization\") || null;\n            logDebug(\"AuthToken in header: \", authToken);\n            if (!authToken) {\n                logDebug(\"Missing authorization token in header 'Authorization' \");\n                let err = new Error(\"Unauthorized\");\n                err.status = 401;\n                next(err);\n            }\n            else {\n                console.log(\"check if token is valid and billing its OK : AUTH_ \", authToken);\n                response.locals = {\n                    username: \"userA\",\n                    authToken: authToken,\n                };\n                next();\n            }\n        }\n        catch (error) {\n            logError(\"Error in middlware \", error);\n            const err = new Error(\"Internal server error\");\n            err.status = 500;\n            next(err);\n        }\n    }\n    else {\n        logDebug(\"Bypassing authorization for url: \", calledUrl);\n        next();\n    }\n};\nmodule.exports = function () {\n    return Router().use(\"/api\", signValidatorHandler);\n};\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/app-middleware/apiAuthenticator.js?");

/***/ }),

/***/ 192:
/*!*****************************************************!*\
  !*** ./src/app-middleware/bodyParserJsonFactory.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\nconst bodyParser = __webpack_require__(/*! body-parser */ 986);\nmodule.exports = function bodyParserJsonFactory() {\n    return bodyParser.json({ limit: '50mb' });\n};\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/app-middleware/bodyParserJsonFactory.js?");

/***/ }),

/***/ 919:
/*!**********************************************************!*\
  !*** ./src/app-middleware/bodyParserUrlEncodeFactory.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\nconst bodyParser = __webpack_require__(/*! body-parser */ 986);\nmodule.exports = function bodyParserUrlEncodeFactory() {\n    return bodyParser.urlencoded({ limit: '50mb', extended: false });\n};\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/app-middleware/bodyParserUrlEncodeFactory.js?");

/***/ }),

/***/ 327:
/*!*******************************************!*\
  !*** ./src/app-middleware/corsFactory.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\nconst cors = __webpack_require__(/*! cors */ 582);\nfunction parseValues(originalValues) {\n    let parsedValues = originalValues;\n    if (originalValues.includes(',')) {\n        parsedValues = originalValues.split(',');\n    }\n    return parsedValues;\n}\nmodule.exports = function corsFactory(config) {\n    let corsOpts = {};\n    if (config.enableCORS) {\n        const origin = parseValues(config.allowedOrigins);\n        const allowedHeaders = parseValues(config.allowedHeaders);\n        corsOpts = ({\n            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],\n            preflightContinue: true,\n            allowedHeaders,\n            origin,\n        });\n    }\n    return cors(corsOpts);\n};\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/app-middleware/corsFactory.js?");

/***/ }),

/***/ 539:
/*!***************************************************!*\
  !*** ./src/app-middleware/errorHandlerFactory.js ***!
  \***************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst logFunctionFactory_1 = __importDefault(__webpack_require__(/*! ~/core-services/logFunctionFactory */ 268));\nconst errorTypes = {\n    badRequest: Symbol.for('bad request'),\n    loginFailed: Symbol.for('login failed'),\n    notFound: Symbol.for('not found')\n};\nmodule.exports = function errorHandlerFactory() {\n    const writeError = logFunctionFactory_1.default.getErrorLogger('errorHandlerFactory');\n    return (err, req, res, next) => {\n        writeError(err);\n        if (res.headersSent) {\n            next(err);\n        }\n        else if (err.status === 400 || err.errorType === errorTypes.badRequest) {\n            res.status(400).json({ message: err.message });\n        }\n        else if (err.status === 401 || err.errorType === errorTypes.loginFailed) {\n            res.status(401).json({ message: 'Unauthorized API access!' });\n        }\n        else if (err.status === 404 || err.errorType === errorTypes.notFound) {\n            res.status(404).json({ message: err.message });\n        }\n        else {\n            next(err);\n        }\n    };\n};\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/app-middleware/errorHandlerFactory.js?");

/***/ }),

/***/ 836:
/*!*************************************************!*\
  !*** ./src/app-middleware/middlewareFactory.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\nconst middlewareFactoryList = __webpack_require__(/*! ./middlewareFactoryList */ 450);\nmodule.exports = function middlewareFactory(config) {\n    return middlewareFactoryList.map((factory) => factory(config));\n};\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/app-middleware/middlewareFactory.js?");

/***/ }),

/***/ 450:
/*!*****************************************************!*\
  !*** ./src/app-middleware/middlewareFactoryList.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\nmodule.exports = [\n    __webpack_require__(/*! ./bodyParserJsonFactory */ 192),\n    __webpack_require__(/*! ./bodyParserUrlEncodeFactory */ 919),\n    // require('./apiAuthenticator'),\n    // require('./verifyOperationBalance'),\n    __webpack_require__(/*! ./requestCalls */ 437),\n    __webpack_require__(/*! ./swaggerFactory */ 391),\n    __webpack_require__(/*! ./corsFactory */ 327),\n    __webpack_require__(/*! ./sessionFactory */ 205),\n    // Routes should immediately precede Error Handlers\n    __webpack_require__(/*! ./staticFilesFactory */ 412),\n    __webpack_require__(/*! ./apiAuthenticator */ 284),\n    __webpack_require__(/*! ./routesFactory */ 415),\n    __webpack_require__(/*! ./unmatchedRouteHandlerFactory */ 515),\n    // Make sure configureErrorHandler is LAST!!!\n    __webpack_require__(/*! ./errorHandlerFactory */ 539),\n];\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/app-middleware/middlewareFactoryList.js?");

/***/ }),

/***/ 437:
/*!********************************************!*\
  !*** ./src/app-middleware/requestCalls.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\nconst { Router } = __webpack_require__(/*! express */ 860);\nconst { logDebug } = (__webpack_require__(/*! src/core-services/logFunctionFactory */ 268).getLogger)('requestCalls');\nfunction requestCallLogHandler(request, response, next) {\n    let body = request.method == 'GET' ? request.query : request.body;\n    if (process.env.LOGGER_LEVEL && process.env.LOGGER_LEVEL.toLocaleLowerCase() == 'debug') {\n        logDebug('[CALL_ROUTE] [', request.originalUrl, '] ', ' METHOD [', request.method, '] BODY ', body);\n    }\n    next();\n}\nfunction AddCorsRules(req, res, next) {\n    res.header('Access-Control-Allow-Origin', '*');\n    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');\n    next();\n}\nmodule.exports = function requestCallLog() {\n    return Router().use(AddCorsRules).use(requestCallLogHandler);\n};\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/app-middleware/requestCalls.js?");

/***/ }),

/***/ 415:
/*!*********************************************!*\
  !*** ./src/app-middleware/routesFactory.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\nconst { Router } = __webpack_require__(/*! express */ 860);\nconst routes = __webpack_require__(/*! ~/routes */ 18);\nlet router = Router();\nrouter.use('/api/v1', routes);\nmodule.exports = function routesFactory() {\n    return router;\n};\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/app-middleware/routesFactory.js?");

/***/ }),

/***/ 205:
/*!**********************************************!*\
  !*** ./src/app-middleware/sessionFactory.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\nvar session = __webpack_require__(/*! express-session */ 508);\nconst { Router } = __webpack_require__(/*! express */ 860);\nlet router = Router();\nconst oneDay = 1000 * 60 * 60 * 24;\nrouter.use(session({\n    secret: 'thisismysecrctekeyfhrgfgrfrty84fwir767',\n    saveUninitialized: true,\n    cookie: { maxAge: oneDay },\n    resave: false\n}));\nmodule.exports = function sessionFactory() {\n    return router;\n};\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/app-middleware/sessionFactory.js?");

/***/ }),

/***/ 412:
/*!**************************************************!*\
  !*** ./src/app-middleware/staticFilesFactory.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\nconst express = __webpack_require__(/*! express */ 860);\nconst path = __webpack_require__(/*! path */ 17);\nconst { Router } = __webpack_require__(/*! express */ 860);\nmodule.exports = function staticFilesFactory() {\n    return [\n        // express.static(path.join(__dirname, '../../iframe')),\n        express.static(path.join(__dirname, '../../webapp'))\n    ];\n};\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/app-middleware/staticFilesFactory.js?");

/***/ }),

/***/ 391:
/*!**********************************************!*\
  !*** ./src/app-middleware/swaggerFactory.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\nconst { Router } = __webpack_require__(/*! express */ 860);\nconst swaggerJSDoc = __webpack_require__(/*! swagger-jsdoc */ 777);\nconst swaggerUI = __webpack_require__(/*! swagger-ui-express */ 948);\nconst pkgJSON = __webpack_require__(/*! ../../package.json */ 147);\nmodule.exports = function swaggerFactory() {\n    const swaggerDefinition = {\n        info: {\n            title: pkgJSON.name,\n            version: pkgJSON.version,\n            description: pkgJSON.description,\n        },\n        basePath: '/api/v1',\n    };\n    const swaggerOptions = {\n        swaggerDefinition,\n        apis: ['src/routes/**/index.js', 'src/routes/index.js'],\n    };\n    const swaggerSpec = swaggerJSDoc(swaggerOptions);\n    return Router()\n        .get('/swagger.json', (request, response) => response.json(swaggerSpec))\n        .use('/api-docs/', swaggerUI.serve, swaggerUI.setup(swaggerSpec));\n};\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/app-middleware/swaggerFactory.js?");

/***/ }),

/***/ 515:
/*!************************************************************!*\
  !*** ./src/app-middleware/unmatchedRouteHandlerFactory.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\nconst { Router } = __webpack_require__(/*! express */ 860);\nfunction unmatchedRouteHandler(request, response, next) {\n    const err = new Error('Not Found');\n    err.status = 404;\n    next(err);\n}\nmodule.exports = function unmatchedRouteHandlerFactory() {\n    return Router()\n        .use(unmatchedRouteHandler);\n};\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/app-middleware/unmatchedRouteHandlerFactory.js?");

/***/ }),

/***/ 944:
/*!***********************!*\
  !*** ./src/config.js ***!
  \***********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\nconst cfg = __webpack_require__(/*! 12factor-config */ 876);\nconst env = {\n    allowedHeaders: {\n        env: \"ALLOWED_HEADERS\",\n        type: \"string\",\n    },\n    allowedOrigins: {\n        env: \"ALLOWED_ORIGINS\",\n        type: \"string\",\n    },\n    appName: {\n        env: \"APP_NAME\",\n        type: \"string\",\n        required: true,\n    },\n    debug: {\n        env: \"DEBUG\",\n        type: \"string\",\n        required: true,\n    },\n    desiredPort: {\n        env: \"PORT\",\n        type: \"integer\",\n        required: true,\n    },\n    enableCORS: {\n        env: \"ENABLE_CORS\",\n        type: \"boolean\",\n    },\n    nodeEnv: {\n        env: \"NODE_ENV\",\n        type: \"enum\",\n        values: [\"development\", \"production\"],\n        default: \"development\",\n    },\n    domain_env: {\n        env: \"DOMAIN_ENV\",\n        type: \"string\",\n        required: true,\n    },\n    acceptedLanguages: {\n        env: \"ACCEPTED_LANGS\",\n        type: \"string\",\n        required: false,\n    },\n    OPENAI_API_KEY: {\n        env: \"OPENAI_API_KEY\",\n        type: \"string\",\n        required: true,\n    },\n    REDIS_URL: {\n        env: \"REDIS_URL\",\n        type: \"string\",\n        required: true,\n    },\n    USE_REDIS: {\n        env: \"USE_REDIS\",\n        type: \"boolean\",\n        required: true,\n    },\n};\nconst loggerEnv = {\n    loggerAMQPBroker: {\n        env: \"LOGGER_AMQP_BROKER\",\n        type: \"string\",\n        required: false,\n    },\n    loggerRemote: {\n        env: \"LOGGER_REMOTE\",\n        type: \"boolean\",\n        default: false,\n    },\n    loggerLevel: {\n        env: \"LOGGER_LEVEL\",\n        type: \"enum\",\n        values: [\"debug\", \"info\", \"warn\", \"error\"],\n        default: \"debug\",\n    },\n};\nObject.assign(env, loggerEnv);\nconst config = cfg(env);\nmodule.exports = config;\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/config.js?");

/***/ }),

/***/ 268:
/*!*************************************************!*\
  !*** ./src/core-services/logFunctionFactory.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\nconst Logger = __webpack_require__(/*! debug */ 974);\nconst Factory = {\n    getLogger: (name) => {\n        return {\n            logError: Logger(`secret-gpt:error:${name}`),\n            logDebug: Logger(`secret-gpt:${name}`)\n        };\n    },\n    getErrorLogger: (name) => {\n        return Logger(`secret-gpt:error:${name}`);\n    },\n    getWarnLogger: (name) => {\n        return Logger(`secret-gpt:warn:${name}`);\n    },\n    getInfoLogger: (name) => {\n        return Logger(`secret-gpt:info:${name}`);\n    },\n    getDebugLogger: (name) => {\n        return Logger(`secret-gpt:debug:${name}`);\n    }\n};\nmodule.exports = Factory;\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/core-services/logFunctionFactory.js?");

/***/ }),

/***/ 42:
/*!*******************************!*\
  !*** ./src/database/index.js ***!
  \*******************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\nconst config = __webpack_require__(/*! ~/config */ 944);\nconst startMongo = __webpack_require__(/*! ./mongo */ 162);\nconst { logDebug, logError } = (__webpack_require__(/*! src/core-services/logFunctionFactory */ 268).getLogger)('chat');\nconst startRedis = __webpack_require__(/*! ./redis */ 673);\n//load config of database url from individual strings\nif (!config.databaseURL) {\n    let url = 'mongodb+srv://';\n    url += process.env.DB_USER + ':';\n    url += process.env.DB_PASS + '@';\n    url += process.env.DB_HOST + '/';\n    // url += process.env.DB_PORT + '/';\n    url += process.env.DB_NAME;\n    // url += '?authSource=admin';\n    //url += '?replicaSet=' + process.env.REPL_SET;\n    url += process.env.COMPLEMENT;\n    config.databaseURL = url;\n}\nlogDebug('MONGO URI CONNECTED :  ', config.databaseURL);\nconst Mongo = startMongo(config.databaseURL);\nlet Redis = {};\n// let RedisSubscribe = {};\nif (process.env.USE_REDIS === 'true') {\n    console.log('Use REDIS try to connect : ', process.env.USE_REDIS);\n    Redis = startRedis(config.redisUrl);\n    // RedisSubscribe = startRedis(config.redisUrl)\n}\nconst Database = {\n    createAccount: (data, options) => {\n        return Mongo.account.create(data, options);\n    },\n    createSession: (data, options) => {\n        return Mongo.session.create(data, options);\n    },\n    findSession: (filter, select, options) => {\n        return Mongo.session.find(filter, select, options);\n    },\n    findAccount: (filter, select, options) => {\n        return Mongo.socialProof.find(filter, select, options);\n    },\n    findAndUpdateBillingDay: (query, data, options) => {\n        return Mongo.billingDay.updateOne(query, data, options);\n    },\n    findAndUpdateBillingLog: (query, data, options) => {\n        return Mongo.billing.updateOne(query, data, options);\n    },\n    findBillingDay: (filter, select, options) => {\n        return Mongo.billingDay.find(filter, select, options);\n    },\n    findBillingLog: (filter, select, options) => {\n        return Mongo.billing.find(filter, select, options);\n    },\n    findUsers: (filter, select, options) => {\n        console.log('BD Filter users ', filter);\n        return Mongo.user.find(filter, select, options);\n    },\n    findSignDocument: async (filter, select, options) => {\n        return await Mongo.signDocument.find(filter, select, options);\n    },\n    findQesBilling: async (filter, select, options) => {\n        return await Mongo.qes_billing.find(filter, select, options);\n    },\n    findEnvironment: async (filter, select, options) => {\n        return await Mongo.environment.find(filter, select, options);\n    },\n    findCompanyProfile: async (filter, select, options) => {\n        return await Mongo.company.find(filter, select, options);\n    },\n    updateCompanyProfile: async (criteria, update, options) => {\n        return await Mongo.company.findOneAndUpdate(criteria, update, options);\n    },\n    saveToken: async (key, token, ttl) => {\n        let sTtl = ttl || config.REDIS_AUTH_TTL;\n        let res = await Redis.SETEX(key, sTtl, token);\n        console.log('result after saved redis key ', res);\n    },\n    getToken: async (key) => {\n        console.log('[DATA_REDIS] will get token...');\n        let token = await Redis.get(key);\n        console.log('[DATA_REDIS] returned token ', token);\n        return token;\n    },\n    initKYCData: async (key, idt, reference) => {\n        let res = await Redis.hset(key, 'ref', reference, 'idt', idt, 'status', 'request.pending');\n        let ex = await Redis.expire(key, 1200); //expire after 20 minutes\n        logDebug('[DATA_REDIS] initKYCData result ', res, ' expire ', ex);\n    },\n    updateKYCData: async (key, field, data) => {\n        let res = await Redis.hset(key, field, data);\n        logDebug('[DATA_REDIS] updateKYCData result ', res);\n    },\n    getKYCData: async (key, param) => {\n        let result;\n        if (!param)\n            result = await Redis.hgetall(key);\n        else\n            result = await Redis.hget(key, param);\n        logDebug('[DATA_REDIS] getKYCData result ', result);\n        return result;\n    }\n};\nmodule.exports = Database;\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/database/index.js?");

/***/ }),

/***/ 162:
/*!*************************************!*\
  !*** ./src/database/mongo/index.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\nconst { logDebug, logError } = (__webpack_require__(/*! src/core-services/logFunctionFactory */ 268).getLogger)('chat');\nconst fs = __webpack_require__(/*! fs */ 358);\nconst path = __webpack_require__(/*! path */ 17);\nconst mongoose = __webpack_require__(/*! mongoose */ 185);\nconst MongoModels = {};\nfunction loadModels() {\n    var path_ = path.resolve('./src/database/mongo/schemas');\n    logDebug('Path : ', path_);\n    // let schema = require(path.resolve(path_, 'ca'))\n    // MongoModels['ca'] = mongoose.model('ca', schema)\n    console.log('OLA ', path.resolve('./schemas/account'));\n    let account = './schemas/account';\n    let billing = './schemas/billing';\n    let billingDay = './schemas/billingDay';\n    MongoModels['account'] = mongoose.model('account', __webpack_require__(318)(`${account}`));\n    MongoModels['billing'] = mongoose.model('billing', __webpack_require__(318)(`${billing}`));\n    MongoModels['billingDay'] = mongoose.model('billingDay', __webpack_require__(318)(`${billingDay}`));\n}\nmodule.exports = function (url) {\n    try {\n        mongoose.connect(url, {\n            useNewUrlParser: true,\n            useUnifiedTopology: true,\n            // useFindAndModify: false,\n            //useCreateIndex: false,\n            connectTimeoutMS: 10000,\n            retryWrites: false\n        });\n        mongoose.connection.on('connected', () => logDebug('Connection to database established'));\n        loadModels();\n        return MongoModels;\n    }\n    catch (error) {\n        logDebug('[DATABASE] ', error);\n    }\n};\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/database/mongo/index.js?");

/***/ }),

/***/ 725:
/*!***********************************************!*\
  !*** ./src/database/mongo/schemas/account.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\nconst Schema = (__webpack_require__(/*! mongoose */ 185).Schema);\nconst accountSchema = new Schema({\n    accountId: Object,\n    apiSecret: Object,\n    email: String\n}, { collection: 'account', versionKey: false });\naccountSchema.set('timestamps', true);\nmodule.exports = accountSchema;\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/database/mongo/schemas/account.js?");

/***/ }),

/***/ 114:
/*!***********************************************!*\
  !*** ./src/database/mongo/schemas/billing.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\nconst Schema = (__webpack_require__(/*! mongoose */ 185).Schema);\nconst TotalBillingDaySchema = new Schema({\n    accountId: String,\n    totalInputWords: {\n        type: Number,\n        default: 1\n    },\n    totalOutputWords: {\n        type: Number,\n        default: 1\n    }\n}, { collection: 'billing', versionKey: false });\nTotalBillingDaySchema.set('timestamps', true);\nmodule.exports = TotalBillingDaySchema;\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/database/mongo/schemas/billing.js?");

/***/ }),

/***/ 104:
/*!**************************************************!*\
  !*** ./src/database/mongo/schemas/billingDay.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\nconst Schema = (__webpack_require__(/*! mongoose */ 185).Schema);\nconst BillingDaySchema = new Schema({\n    accountId: String,\n    inputWords: {\n        type: Number,\n        default: 0\n    },\n    outputWorks: {\n        type: Number,\n        default: 0\n    },\n    key: String\n}, { collection: 'billingDay', versionKey: false });\nBillingDaySchema.set('timestamps', true);\nmodule.exports = BillingDaySchema;\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/database/mongo/schemas/billingDay.js?");

/***/ }),

/***/ 678:
/*!***********************************************!*\
  !*** ./src/database/mongo/schemas/session.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\nconst Schema = (__webpack_require__(/*! mongoose */ 185).Schema);\nconst sessionSchema = new Schema({\n    accountId: String,\n    sessionId: String\n}, { collection: 'session', versionKey: false });\nsessionSchema.set('timestamps', true);\nsessionSchema.createIndex({ closeOfferAt: 1 }, { expireAfterSeconds: 300 });\nmodule.exports = sessionSchema;\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/database/mongo/schemas/session.js?");

/***/ }),

/***/ 673:
/*!*************************************!*\
  !*** ./src/database/redis/index.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\nconst { logDebug, logError } = (__webpack_require__(/*! src/core-services/logFunctionFactory */ 268).getLogger)('chat');\nconst redis = __webpack_require__(/*! async-redis */ 454);\nmodule.exports = function (redisUrl) {\n    let redisClient = redis.createClient(redisUrl);\n    redisClient.on('connect', () => logDebug('REDIS connection established ', redisUrl));\n    redisClient.on('end', () => logDebug('REDIS connection closed'));\n    redisClient.on('error', (err) => logDebug('REDIS connection error ', err.message));\n    return redisClient;\n};\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/database/redis/index.js?");

/***/ }),

/***/ 341:
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
eval("\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst { logDebug } = (__webpack_require__(/*! src/core-services/logFunctionFactory */ 268).getLogger)('app');\nconst express_1 = __importDefault(__webpack_require__(/*! express */ 860));\nconst middlewareFactory_1 = __importDefault(__webpack_require__(/*! ./app-middleware/middlewareFactory */ 836));\nconst config_1 = __importDefault(__webpack_require__(/*! ./config */ 944));\nlogDebug('app');\nconst app = (0, express_1.default)();\napp.use((0, middlewareFactory_1.default)(config_1.default));\nconst port = parseInt(config_1.default.desiredPort, 10);\napp.listen(port, () => {\n    logDebug(`Server is running on port ${port}`);\n});\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/index.ts?");

/***/ }),

/***/ 751:
/*!*************************************!*\
  !*** ./src/lib/characterBuilder.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.promptTemplate = void 0;\nfunction getIndefiniteArticle(word) {\n    // Convert the word to lowercase for case-insensitive comparison\n    const lowercaseWord = word.toLowerCase();\n    // Words that start with a vowel (a, e, i, o, u) take \"an\" as the indefinite article\n    const vowels = ['a', 'e', 'i', 'o', 'u'];\n    if (vowels.includes(lowercaseWord.charAt(0))) {\n        return 'an';\n    }\n    // Special cases for words starting with a silent 'h' and a vowel sound\n    const silentHExceptions = ['honest', 'hour', 'heir', 'honor', 'honour'];\n    for (const exception of silentHExceptions) {\n        if (lowercaseWord.startsWith(exception)) {\n            return 'an';\n        }\n    }\n    // Default to \"a\" for all other words\n    return 'a';\n}\nfunction joinWithCommasAnd(array) {\n    if (!Array.isArray(array)) {\n        throw new Error('Input must be an array.');\n    }\n    const length = array.length;\n    if (length === 0) {\n        return '';\n    }\n    else if (length === 1) {\n        return array[0];\n    }\n    else if (length === 2) {\n        return array.join(' and ');\n    }\n    else {\n        const lastItem = array[length - 1];\n        const firstPart = array.slice(0, length - 1).join(', ');\n        return `${firstPart}, and ${lastItem}`;\n    }\n}\nconst buildPersonality = (personality) => {\n    const personalityString = `Your personality is ${joinWithCommasAnd(personality.traits)}`;\n    return `${personalityString}. Also you speak in ${getIndefiniteArticle(personality.dialogueStyle)} ${personality.dialogueStyle} manner.`;\n};\nconst buildBackgroundStory = (backgroundStory) => {\n    return `Your background story is: ${backgroundStory}.`;\n};\nconst buildGameKnowledge = (gameKnowledge) => {\n    return `Your knowledge about the game events is that: ${gameKnowledge}. You will only talk about these game events when questioned and reply to the extent to your of your knowledge of those events.`;\n};\nconst buildInterests = (interests) => {\n    return `Besides game events you are only able to talk about your interests and according to your knowledge score. From 0 to 10, with 0 being not interested and 10 being very interested. Your interests are ${joinWithCommasAnd(Object.entries(interests).map(([i, v]) => `${i}  with a  knowledge score of ${v}/10`))}.`;\n};\nconst buildSupportiveness = (supportiveness) => {\n    return `From 0 to 10, with 0 being not helpful at all and 10 being very helpful. Your level of support is ${supportiveness}.`;\n};\nconst promptTemplate = (character) => {\n    return `You are ${character.name}, a character of a RPG game, you are ${character.age} years old. ${buildPersonality(character.personality)} ${buildBackgroundStory(character['background story'])} ${buildGameKnowledge(character['game knowledge'])} ${buildInterests(character.interests)} ${buildSupportiveness(character.supportiveness)} You are only able to talk about your background story and you only know stuff about your interests and nothing else! Wait for my prompt question to start answering with short and concise replies with no more than 40 words.`;\n};\nexports.promptTemplate = promptTemplate;\n// Your are John, a character of a RPG game, you are 35 years old. Your personality is friendly, optimistic, and adventurous. Also you speak in a casual manner.\n// Your background story is: John is a skilled adventurer who has traveled the world in search of hidden treasures. He is always eager to help others and believes in the power of friendship.\n//  Your knowledge about game events is that:  John knows that there was a crime scene, he also knows about Alice affair with Joseph. You will only talk about game events when questioned and reply ato the extent of your knowledge of those events.\n// Besides game events you are only able to talk about your interests and according to your knowledge score\n// Your interests  are technology  with a  knowledge score of 7/10 and cars with a score of 10/10.\n// Wait for my prompt question to start answering\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/lib/characterBuilder.ts?");

/***/ }),

/***/ 622:
/*!***************************!*\
  !*** ./src/lib/openai.js ***!
  \***************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst openai_1 = __webpack_require__(/*! openai */ 118);\nconst config_1 = __webpack_require__(/*! ~/config */ 944);\nconst configuration = new openai_1.Configuration({\n    apiKey: config_1.OPENAI_API_KEY\n});\nconst openai = new openai_1.OpenAIApi(configuration);\nexports[\"default\"] = openai;\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/lib/openai.js?");

/***/ }),

/***/ 567:
/*!****************************!*\
  !*** ./src/routes/auth.js ***!
  \****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\nconst { authLogin, resetApiKey, createAccount } = __webpack_require__(/*! src/services/auth */ 797);\nconst { logDebug, logError } = (__webpack_require__(/*! src/core-services/logFunctionFactory */ 268).getLogger)('chat');\nconst { Router } = __webpack_require__(/*! express */ 860);\nconst router = Router();\nrouter.post('/gen-auth', async (request, response) => {\n    try {\n        console.log(' **** Auth token route **** ');\n        console.log(' **** locals ', response.locals.username, ' auth token ', response.locals.authToken);\n        response.status(200).json({\n            token: response.locals.authToken,\n            username: response.locals.username\n        });\n    }\n    catch (ex) {\n        logError('get todo ', ex);\n        response.status(500).json({ error: ex });\n    }\n});\nrouter.post('/login', async (request, response) => {\n    try {\n        console.log(' **** login **** ');\n        console.log(' **** locals ', response.locals.username, ' auth token ', response.locals.authToken);\n        let authToken = await authLogin();\n        response.status(200).json({\n            token: authToken\n        });\n    }\n    catch (ex) {\n        logError('login error ', ex);\n        response.status(500).json({ error: ex });\n    }\n});\nrouter.post('/reset-secret', async (request, response) => {\n    try {\n        console.log(' **** reset-secret **** route ');\n        console.log(' **** locals ', response.locals.username, ' auth token ', response.locals.authToken);\n        response.status(200).json({\n            token: response.locals.authToken,\n            username: response.locals.username\n        });\n    }\n    catch (ex) {\n        logError('get todo ', ex);\n        response.status(500).json({ error: ex });\n    }\n});\nrouter.post('/create-account', async (request, response) => {\n    try {\n        console.log(' **** reset-secret **** route ');\n        console.log(' **** locals ', response.locals.username, ' auth token ', response.locals.authToken);\n        let a = await createAccount(request.body);\n        response.status(200).json({ newAccount: a });\n    }\n    catch (ex) {\n        logError('create-account log error ', ex);\n        response.status(500).json({ error: ex });\n    }\n});\nmodule.exports = router;\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/routes/auth.js?");

/***/ }),

/***/ 548:
/*!****************************!*\
  !*** ./src/routes/chat.js ***!
  \****************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst openai_1 = __webpack_require__(/*! ~/services/openai */ 329);\nconst billing_1 = __webpack_require__(/*! ~/services/billing */ 86);\nconst { logDebug, logError } = (__webpack_require__(/*! src/core-services/logFunctionFactory */ 268).getLogger)('chat');\nconst { Router } = __webpack_require__(/*! express */ 860);\nconst router = Router();\nrouter.get('/list-engines', async (request, response) => {\n    try {\n        const engines = await (0, openai_1.listEngines)();\n        response.status(200).json(engines);\n    }\n    catch (ex) {\n        logError('get todo ', ex);\n        response.status(500).json({ error: ex });\n    }\n});\nrouter.post('/test_billing', async (request, response) => {\n    try {\n        console.log('Billing account route ***** ', request.body);\n        let inputWords = await (0, billing_1.inputBillingEvent)(request.body);\n        let outputWords = await (0, billing_1.outputBillingEvent)(request.body);\n        response.status(200).json({ inputWords, outputWords });\n    }\n    catch (ex) {\n        logError('test_billing  ', ex);\n        response.status(500).json({ error: ex });\n    }\n});\nrouter.post('/send-message', async (request, response) => {\n    const userInput = request.body.text;\n    try {\n        logDebug('send-message request:', userInput);\n        const response = {}; //await createCompletion({ prompt: userInput })\n        logDebug('Response:', response.status, response.statusText, openai_1.createCompletion);\n        const { choices } = await response.json();\n        if (choices && choices.length > 0) {\n            const generatedResponse = choices[0].message.content.trim();\n            response.json({ response: generatedResponse });\n        }\n        else {\n            response.status(500).json({ error: 'No response from the OpenAI API' });\n        }\n    }\n    catch (error) {\n        logError('Error:', error?.message);\n        response.status(500).json({ error: 'An error occurred' });\n    }\n});\nrouter.post('/generate-prompt', async (request, res) => {\n    const characterJson = request.body;\n    try {\n        logDebug('send-message request:', characterJson);\n        const response = await (0, openai_1.generatePrompt)({ characterJson });\n        logDebug('Response:', response);\n        const { prompt } = await response;\n        if (prompt) {\n            res.json({ response: prompt });\n        }\n        else {\n            res.status(500).json({ error: 'No response from the OpenAI API' });\n        }\n    }\n    catch (error) {\n        logError('Error:', error?.message);\n        res.status(500).json({ error: 'An error occurred' });\n    }\n});\nrouter.put('/:id', async (request, response) => {\n    try {\n        const updated = await (0, openai_1.createCompletion)(request.params.id, request.body);\n        response.status(200).json(updated);\n    }\n    catch (ex) {\n        logError('get todo ', ex);\n        response.status(500).json({ error: ex });\n    }\n});\nrouter.delete('/:id', async (request, response) => {\n    try {\n        const del = await (0, openai_1.createCompletion)(request.params.id);\n        response.status(200).json(del);\n    }\n    catch (ex) {\n        logError('get todo ', ex);\n        response.status(500).json({ error: ex });\n    }\n});\nmodule.exports = router;\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/routes/chat.js?");

/***/ }),

/***/ 18:
/*!*****************************!*\
  !*** ./src/routes/index.js ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\nconst writeError = (__webpack_require__(/*! ~/core-services/logFunctionFactory */ 268).getErrorLogger)('routes');\nconst { Router } = __webpack_require__(/*! express */ 860);\nconst fs = __webpack_require__(/*! fs */ 358);\nconst path = __webpack_require__(/*! path */ 17);\nconst router = Router();\nfunction loadRoutes() {\n    const routePath = path.resolve('./src/routes');\n    fs.readdirSync(routePath).forEach(async (file) => {\n        const extension = file.slice(file.length - 3, file.length);\n        if (file === 'index.js' || extension !== '.js')\n            return;\n        try {\n            const baseRoot = file.slice(0, file.length - 3);\n            const route = await __webpack_require__(150)(`./${file}`);\n            // let route = require('./chat')\n            router.use(`/${baseRoot}`, route);\n        }\n        catch (err) {\n            writeError('Error loading route ', file, ' ', err);\n        }\n    });\n}\nloadRoutes();\nmodule.exports = router;\n/**\n * @swagger\n * definitions:\n *  apiInfo:\n *    properties:\n *      title:\n *        type: string\n *        description: The title of the API\n *      environment:\n *        type: string\n *        description: The environment\n *      version:\n *        type: string\n *        description: The version of the API\n *      commit:\n *        type: string\n *        description: The commit hash\n *  todo:\n *    properties:\n *      title:\n *        type: string\n *        description: Description of the To Do\n *      description:\n *        type: string\n *        description: Todo Description\n *      author:\n *        type: string\n *        description: The author of that todo\n *      state:\n *        type: string\n *        description: the state of that todo [ative, delete, completed]\n *      tags:\n *        type: array\n *        description: string arrays representing all the tags of the todo tags\n */\n/**\n * @swagger\n * /getRoot:\n *  get:\n *    tags:\n *      - GetRoot\n *    description: Returns information about the API\n *    produces:\n *      - application/json\n *    responses:\n *      200:\n *        description: The API information\n *        schema:\n *          $ref: '#/definitions/apiInfo'\n */\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/routes/index.js?");

/***/ }),

/***/ 797:
/*!******************************!*\
  !*** ./src/services/auth.js ***!
  \******************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n// eslint-disable-next-line arrow-body-style\nconst DB = __webpack_require__(/*! src/database */ 42);\nconst logError = console.log;\nconst ADMIN_TOKEN = 'bWFzdGVydmlhbmE6YmVuZmljYSNkaW1hcmlh';\nconst crypto = __webpack_require__(/*! crypto */ 113);\nfunction generateKey(size = 32, format = 'base64') {\n    const buffer = crypto.randomBytes(size);\n    return buffer.toString(format);\n}\nconst authLogin = async function (data) {\n    console.log('********* authenticator route **********', data);\n    let token = generateKey(12);\n    let newBody = {\n        accountId: data.accountId,\n        sessionId: token\n    };\n    let createdSession = await DB.createSession(newBody);\n    console.log('created session id ', createdSession);\n    try {\n        return { authToken: token };\n    }\n    catch (ex) {\n        logError('Error validating data ', ex);\n        throw ex;\n    }\n};\nconst createAccount = async function (data) {\n    console.log('********* create account route **********', data);\n    if (!data.email) {\n        throw 'Should supply email account';\n    }\n    try {\n        let newAccount = {\n            email: data.email,\n            apiKey: generateKey(),\n            apiSecret: generateKey(64)\n        };\n        let newAccountCreated = await DB.createAccount(newAccount);\n        return { newAccountCreated };\n    }\n    catch (ex) {\n        logError('Error validating data ', ex);\n        throw ex;\n    }\n};\nconst listAccount = async function (data) {\n    console.log('********* listAccount route **********', data);\n    try {\n        let account = {};\n        return { authToken: '0x13124124343' };\n    }\n    catch (ex) {\n        logError('Error validating data ', ex);\n        throw ex;\n    }\n};\nconst resetApiKey = async function (data) {\n    console.log('********* authenticator route **********', data);\n    try {\n        return { authToken: '0x13124124343' };\n    }\n    catch (ex) {\n        logError('Error validating data ', ex);\n        throw ex;\n    }\n};\nmodule.exports = { authLogin, resetApiKey, createAccount };\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/services/auth.js?");

/***/ }),

/***/ 86:
/*!*********************************!*\
  !*** ./src/services/billing.js ***!
  \*********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n// eslint-disable-next-line arrow-body-style\nconst logError = console.log;\nconst DB = __webpack_require__(/*! src/database */ 42);\nfunction countWords(str) {\n    return str.trim().split(/\\s+/).length;\n}\n/**\n * From the input words, count words\n * - add entry to billing day input\n * - increase total billing input\n */\nconst inputBillingEvent = async function (inputData) {\n    let wordsCount = countWords(inputData.messageIn || 'ola este e só para testar, vamos ver quantas palavras é que isto manja! ');\n    console.log('********* inputBillingEvent service **********', inputData);\n    console.log('Total Words #', wordsCount);\n    var today = new Date();\n    const day = today.getDate();\n    const month = today.getMonth() + 1;\n    const year = today.getFullYear();\n    const key = day + month + year;\n    //increment billing log\n    let updateBody = {\n        $inc: { totalInputWords: wordsCount }\n    };\n    const options = { upsert: true };\n    let result = await DB.findAndUpdateBillingLog({ accountId: inputData.accountId }, updateBody, options);\n    // increment billing with day key\n    let billingDayKey = await DB.findAndUpdateBillingDay({ key: key, accountId: inputData.accountId }, { $inc: { inputWords: wordsCount } }, options);\n    try {\n        return { data: wordsCount };\n    }\n    catch (ex) {\n        logError('Error validating data ', ex);\n        throw ex;\n    }\n};\n/**\n * From the output words, count words\n * - add entry to billing day input\n * - increase total billing input\n */\nconst outputBillingEvent = async function (inputData) {\n    let wordsCount = countWords(inputData.messageOut || 'ola este e só para testar, vamos ver quantas palavras é que isto manja! ');\n    console.log('********* inputBillingEvent service **********', inputData);\n    console.log('Total Words #', wordsCount);\n    var today = new Date();\n    const day = today.getDate();\n    const month = today.getMonth() + 1;\n    const year = today.getFullYear();\n    const key = day + month + year;\n    //increment billing log\n    const options = { upsert: true };\n    let billingLogOut = await DB.findAndUpdateBillingLog({ accountId: inputData.accountId }, { $inc: { totalOutputWords: wordsCount } }, options);\n    // increment billing with day key\n    let billingDayKey = await DB.findAndUpdateBillingDay({ key: key, accountId: inputData.accountId }, { $inc: { outputWorks: wordsCount } }, options);\n    try {\n        return { data: wordsCount };\n    }\n    catch (ex) {\n        logError('Error validating data ', ex);\n        throw ex;\n    }\n};\nmodule.exports = { inputBillingEvent, outputBillingEvent };\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/services/billing.js?");

/***/ }),

/***/ 329:
/*!********************************!*\
  !*** ./src/services/openai.ts ***!
  \********************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst openai_1 = __importDefault(__webpack_require__(/*! src/lib/openai */ 622));\nconst characterBuilder_1 = __webpack_require__(/*! ~/lib/characterBuilder */ 751);\nconst generatePrompt = async ({ characterJson }) => {\n    const prompt = (0, characterBuilder_1.promptTemplate)(characterJson);\n    return { prompt };\n};\nmodule.exports = {\n    createCompletion: async ({ prompt }) => {\n        const response = await openai_1.default.createCompletion({\n            model: 'text-davinci-003',\n            prompt,\n            max_tokens: 7,\n            temperature: 0\n        });\n        return response.data;\n    },\n    listEngines: async () => {\n        const response = await openai_1.default.listEngines();\n        return response.data;\n    },\n    generatePrompt\n};\n\n\n//# sourceURL=webpack://secret-gpt-api/./src/services/openai.ts?");

/***/ }),

/***/ 318:
/*!***************************************!*\
  !*** ./src/database/mongo/ sync ^.*$ ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("var map = {\n\t\".\": 162,\n\t\"./\": 162,\n\t\"./index\": 162,\n\t\"./index.js\": 162,\n\t\"./schemas/account\": 725,\n\t\"./schemas/account.js\": 725,\n\t\"./schemas/billing\": 114,\n\t\"./schemas/billing.js\": 114,\n\t\"./schemas/billingDay\": 104,\n\t\"./schemas/billingDay.js\": 104,\n\t\"./schemas/session\": 678,\n\t\"./schemas/session.js\": 678\n};\n\n\nfunction webpackContext(req) {\n\tvar id = webpackContextResolve(req);\n\treturn __webpack_require__(id);\n}\nfunction webpackContextResolve(req) {\n\tif(!__webpack_require__.o(map, req)) {\n\t\tvar e = new Error(\"Cannot find module '\" + req + \"'\");\n\t\te.code = 'MODULE_NOT_FOUND';\n\t\tthrow e;\n\t}\n\treturn map[req];\n}\nwebpackContext.keys = function webpackContextKeys() {\n\treturn Object.keys(map);\n};\nwebpackContext.resolve = webpackContextResolve;\nmodule.exports = webpackContext;\nwebpackContext.id = 318;\n\n//# sourceURL=webpack://secret-gpt-api/./src/database/mongo/_sync_^.*$?");

/***/ }),

/***/ 150:
/*!***********************************!*\
  !*** ./src/routes/ sync ^\.\/.*$ ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("var map = {\n\t\"./\": 18,\n\t\"./auth\": 567,\n\t\"./auth.js\": 567,\n\t\"./chat\": 548,\n\t\"./chat.js\": 548,\n\t\"./index\": 18,\n\t\"./index.js\": 18\n};\n\n\nfunction webpackContext(req) {\n\tvar id = webpackContextResolve(req);\n\treturn __webpack_require__(id);\n}\nfunction webpackContextResolve(req) {\n\tif(!__webpack_require__.o(map, req)) {\n\t\tvar e = new Error(\"Cannot find module '\" + req + \"'\");\n\t\te.code = 'MODULE_NOT_FOUND';\n\t\tthrow e;\n\t}\n\treturn map[req];\n}\nwebpackContext.keys = function webpackContextKeys() {\n\treturn Object.keys(map);\n};\nwebpackContext.resolve = webpackContextResolve;\nmodule.exports = webpackContext;\nwebpackContext.id = 150;\n\n//# sourceURL=webpack://secret-gpt-api/./src/routes/_sync_^\\.\\/.*$?");

/***/ }),

/***/ 876:
/*!**********************************!*\
  !*** external "12factor-config" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("12factor-config");

/***/ }),

/***/ 454:
/*!******************************!*\
  !*** external "async-redis" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("async-redis");

/***/ }),

/***/ 986:
/*!******************************!*\
  !*** external "body-parser" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("body-parser");

/***/ }),

/***/ 582:
/*!***********************!*\
  !*** external "cors" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("cors");

/***/ }),

/***/ 974:
/*!************************!*\
  !*** external "debug" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("debug");

/***/ }),

/***/ 860:
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("express");

/***/ }),

/***/ 508:
/*!**********************************!*\
  !*** external "express-session" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("express-session");

/***/ }),

/***/ 185:
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("mongoose");

/***/ }),

/***/ 118:
/*!*************************!*\
  !*** external "openai" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("openai");

/***/ }),

/***/ 777:
/*!********************************!*\
  !*** external "swagger-jsdoc" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = require("swagger-jsdoc");

/***/ }),

/***/ 948:
/*!*************************************!*\
  !*** external "swagger-ui-express" ***!
  \*************************************/
/***/ ((module) => {

"use strict";
module.exports = require("swagger-ui-express");

/***/ }),

/***/ 113:
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ 358:
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 17:
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 147:
/*!**********************!*\
  !*** ./package.json ***!
  \**********************/
/***/ ((module) => {

"use strict";
eval("module.exports = JSON.parse('{\"name\":\"secret-gpt-api\",\"version\":\"1.0.0\",\"description\":\"\",\"main\":\"./src/index.ts\",\"scripts\":{\"start\":\"npm run serve\",\"serve\":\"webpack --watch --env mode=development --config webpack.config.ts\",\"clean:dev\":\"rimraf build\",\"clean:prod\":\"rimraf dist\",\"build\":\"webpack --mode production --config webpack.config.ts\",\"dev\":\"nodemon build/index.js --watch build\",\"prod\":\"nodemon dist/index.js --watch dist\",\"test\":\"echo \\\\\"Error: no test specified\\\\\" && exit 1\",\"lint\":\"eslint\"},\"files\":[\"dist/**/*\"],\"keywords\":[],\"author\":\"\",\"license\":\"ISC\",\"devDependencies\":{\"@babel/core\":\"^7.22.9\",\"@babel/preset-env\":\"^7.22.9\",\"@babel/preset-typescript\":\"^7.22.5\",\"@types/cookie-parser\":\"^1.4.3\",\"@types/cors\":\"^2.8.13\",\"@types/express\":\"^4.17.17\",\"@types/node\":\"^20.4.2\",\"@types/webpack\":\"^5.28.1\",\"@types/webpack-node-externals\":\"^3.0.0\",\"@typescript-eslint/eslint-plugin\":\"^6.1.0\",\"@typescript-eslint/parser\":\"^6.1.0\",\"12factor-config\":\"^2.0.0\",\"babel-loader\":\"^9.1.3\",\"dotenv\":\"^16.3.1\",\"eslint\":\"^8.45.0\",\"eslint-config-airbnb-base\":\"^15.0.0\",\"eslint-config-standard\":\"^17.1.0\",\"eslint-plugin-import\":\"^2.27.5\",\"eslint-plugin-node\":\"^11.1.0\",\"eslint-plugin-promise\":\"^6.1.1\",\"eslint-plugin-standard\":\"^5.0.0\",\"express-session\":\"^1.17.3\",\"nodemon\":\"^3.0.1\",\"openai\":\"^3.3.0\",\"prettier\":\"^3.0.0\",\"rimraf\":\"^5.0.1\",\"swagger-jsdoc\":\"^6.2.8\",\"swagger-ui-express\":\"^5.0.0\",\"ts-loader\":\"^9.4.4\",\"ts-node\":\"^10.9.1\",\"typescript\":\"^5.1.6\",\"webpack\":\"^5.88.2\",\"webpack-cli\":\"^5.1.4\",\"webpack-dev-server\":\"^4.15.1\",\"webpack-node-externals\":\"^3.0.0\",\"webpack-shell-plugin-next\":\"^2.3.1\"},\"dependencies\":{\"async-redis\":\"^2.0.0\",\"cookie-parser\":\"^1.4.6\",\"cors\":\"^2.8.5\",\"debug\":\"^4.3.4\",\"eslint-config-airbnb\":\"^19.0.4\",\"express\":\"^4.18.2\",\"mongoose\":\"^7.4.1\"}}');\n\n//# sourceURL=webpack://secret-gpt-api/./package.json?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(341);
/******/ 	
/******/ })()
;