import * as bodyParser from "body-parser";
import * as express from "express";
import {IRoute} from "./controller/IRoute";
import {corsMiddlewater} from "./middlewares";
import {DatabaseService} from "./service/database.service";
import {SensorService} from "./service/sensor.service";
import ProductRouter from "./controller/product/product.router";

export class Server {
    public static bootstrap(): Server {
        return new Server();
    }

    public app: express.Application;

    private constructor() {
        this.app = express();
        this.config();
        this.routes();
    }

    public config() {
        // Start data base
        require('dotenv').load();
        this.app.use(bodyParser.urlencoded({extended: true}));
        this.app.use(bodyParser.json({limit: "50mb"}));
        DatabaseService.init();

        const sensorService = new SensorService();
        if (process.env.SENSOR_PRIVATE_KEY) {
            sensorService.startListening();
        }
        corsMiddlewater(this.app);
    }

    /**
     * Create router
     *
     * @class Server
     * @method api
     */
    public routes() {
        [
            ProductRouter.create()
        ].forEach((route: IRoute) => {
            route.decorate(this.app);
        });
    }
}