export let corsMiddlewater = (app) => {
    app.use((req, res, next) => {

        res.setHeader("Access-Control-Allow-Origin", "*");

        // Request headers you wish to allow
        res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, " +
            "Authorization, Origin, x-requested-with, Content-Type, Content-Range, " +
            "Content-Disposition, Content-Description, x-token, x-userid");
        res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE");
        next();

    });
};
