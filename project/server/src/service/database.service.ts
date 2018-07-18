import * as path from "path";
import * as Sequelize from "sequelize";

export class DatabaseService {
    public static ProductDatabase;
    private static database;

    public static init() {
        this.database = new Sequelize("database", null, null, {
            dialect: "sqlite",
            storage: path.resolve("database.sqlite"),
        });

        this.ProductDatabase = this.database.define("Product", {
            publicKey: Sequelize.STRING
        });

        this.ProductDatabase.sync();
    }
}