import {Sequelize, ModelCtor} from "sequelize-typescript";


export class Database
{
    private static sequelize : Sequelize = new Sequelize({
        database: "flnpd_os_system_db",
        dialect: 'sqlite',
        storage: "./flnpd_os_system_db.sqlite3"
    });

    static async ClearDatabase( )
    {
        await this.sequelize.drop();
        await this.sequelize.sync();
    }

    static async AddModels( models : ModelCtor[] )
    {
        this.sequelize.addModels( models );
        await this.sequelize.sync();
    }
}