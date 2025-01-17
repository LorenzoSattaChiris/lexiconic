/* ----- Loading Packages  ----- */
const compression = require("compression");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const subdomain = require("express-subdomain");
const helmet = require("helmet");
const dotenv = require("dotenv");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const os = require("os");
const rateLimit = require('express-rate-limit');
const safeGet = require('./utils/safeGet');

/* ----- Initial Configuration  ----- */
const app = express();

/* ----- General Rate Limit  ----- */
// Disabled as sometimes causes errors and would need further testing
// const limiter = rateLimit({
//     windowMs: 1 * 60 * 1000, // 1 minute
//     max: 100, // limit each IP to 100 requests per windowMs
//     keyGenerator: (req) => {
//         const forwarded = req.headers['x-forwarded-for'];
//         const ip = forwarded ? forwarded.split(',')[0] : req.ip;
//         return ip;
//     },
//     handler: (req, res, next) => {
//         const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.ip;
//         const error = new Error(`Too many requests from IP ${ip}, please try again later.`);
//         error.status = 429;
//         next(error);
//     }
// });

/* ----- Packages  ----- */
app.use(logger("dev"));
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(compression());
app.use(helmet({ contentSecurityPolicy: false }));
// app.use(limiter);
dotenv.config();

/* ----- Loading Routes  ----- */
app.set("view engine", "ejs");
app.engine('ejs', require('ejs').__express);
app.set("views", [__dirname + "/pages", __dirname + "/app"]);
app.use(express.static(__dirname + "/assets"));
app.use(express.static(__dirname + "/assets/audio"));
app.use(express.static(__dirname + "/assets/docs"));
app.use(express.static(__dirname + "/assets/gif"));
app.use(express.static(__dirname + "/assets/icons"));
app.use(express.static(__dirname + "/assets/images"));
app.use(express.static(__dirname + "/assets/log"));
app.use(express.static(__dirname + "/assets/logo"));
app.use(express.static(__dirname + "/assets/md"));
app.use(express.static(__dirname + "/assets/sound"));
app.use(express.static(__dirname + "/assets/videos"));
app.use(express.static(__dirname + "/css"));
app.use(express.static(__dirname + "/css/errors"));
app.use(express.static(__dirname + "/js"));
app.use(express.static(__dirname + "/public"));
app.use(express.static(path.join(__dirname, 'Fonts')));

/* ----- SubDomain (Dashboard)  ----- */
const router = express.Router();
app.use(subdomain("app", router));

/* ----- Loading Files  ----- */
const staticRoutes = require('./routes/static/static_routes.js');

/* ----- Static Website ----- */
app.use("/", staticRoutes);

/* ----- Other Routes  ----- */
const chatgptRouter = require('./utils/chatgpt.js');
app.use('/ai', chatgptRouter);

const dictionaryRoutes = require('./utils/dictionary.js');
app.use('/dictionary', dictionaryRoutes);

app.use('/sitemap.xml', express.static(path.join(__dirname, 'pages/sitemap.xml')));

/* ----- Server ----- */
// Catch-all route for 404 errors
app.use(function (req, res, next) {
    const error = new Error("Page Not Found");
    error.status = 404;
    next(error);
});

const highlightStackTrace = require('./utils/highlightStackTrace');

// ----- Updated Error-Handling Middleware -----
app.use((err, req, res, next) => {
    const env = app.get("env") || "production"; 
    // env = "production"; // Turn on For Testing In Production
    const status = safeGet(err.status, 500);
    const errorMessage = safeGet(err.message, "An unexpected error occurred");
    const errorName = safeGet(err.name, "Unknown Error");
    const errorCode = safeGet(err.code, "N/A");
    const errorStack = safeGet(err.stack, "No stack trace available");

    // Prepare variables for error-dev.ejs
    const networkInfo = {
        protocol: safeGet(req.protocol, "N/A"),
        method: safeGet(req.method, "N/A"),
        url: safeGet(req.originalUrl, "N/A"),
        clientIP: safeGet(req.ip, "N/A"),
        userAgent: safeGet(req.headers["user-agent"], "N/A"),
        host: safeGet(req.headers.host, "N/A"),
        queryParams: safeGet(req.query, {}),
        body: safeGet(req.body, {}),
        headers: safeGet(req.headers, {}),
        session: safeGet(req.session, {}),
        params: safeGet(req.params, {}),
    };

    const serverInfo = {
        nodeVersion: safeGet(process.version, "N/A"),
        os: safeGet(`${os.type()} ${os.release()}`, "N/A"),
        processUptime: safeGet(`${process.uptime().toFixed(2)} seconds`, "N/A"),
        workingDirectory: safeGet(process.cwd(), "N/A"),
        memoryUsage: process.memoryUsage(),
    };

    const routeInfo = {
        path: safeGet(req.route ? req.route.path : null, "Unknown"),
        methods: safeGet(req.route ? req.route.methods : null, {}),
    };

    const errorTimestamp = new Date().toISOString();

    // Inside the error handler:
    const formattedStack = highlightStackTrace(err.stack || "No stack trace available");

    const sanitizedReq = {
        protocol: req.protocol,
        method: req.method,
        originalUrl: req.originalUrl,
        ip: req.ip,
        headers: req.headers,
        query: req.query,
        params: req.params,
        body: req.body,
        cookies: req.cookies,
        route: req.route ? { path: req.route.path, methods: req.route.methods } : null,
    };

    if (env === "development") {
        res.status(status).render("errors/error-dev", {
            status,
            name: errorName,
            code: errorCode,
            message: errorMessage,
            stack: errorStack,
            networkInfo,
            serverInfo,
            formattedStack: formattedStack,
            errorTimestamp: errorTimestamp,
            routeInfo: routeInfo,
            req: sanitizedReq,
        });
    } else {
        res.status(status).render("errors/error-prod", {
            status,
            message: errorMessage,
        });
    }
});

// Redirect to HTTPS
app.use(function (req, res, next) {
    if (req.secure) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    next();
});

const port = safeGet(process.env.PORT, 3000);
app.listen(port, () => {
    console.log("Server is listening on:", port);
});