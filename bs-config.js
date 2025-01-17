// bs-config.js - BrowserSync configuration for automatic reloading in development

module.exports = {
    proxy: "http://localhost:3000", // Your local server
    files: [
        "css/**/*.css",              // All CSS files in the 'css' folder
        "db/**/*",                   // All files in the 'db' folder
        "Fonts/**/*",                // All files in the 'Fonts' folder
        "pages/**/*.{ejs,js,css}",   // All relevant files in 'pages'
        "js/**/*.js",                // All JS files
        "app/**/*.ejs",              // All EJS files in 'app'
        "logos/**/*",                // All files in the 'logos' folder
        "images/**/*",               // All files in the 'images' folder
        "assets/**/*",               // All files in the 'assets' folder
    ],
    port: 3001,
    notify: false,
    reloadDebounce: 1000,
    watchOptions: {
        usePolling: false,
        ignoreInitial: true,
        ignored: ['node_modules', '.git']
    },
};
