import {Sequelize, ModelCtor} from "sequelize-typescript";


export class Database
{
    private static sequelize : Sequelize = new Sequelize({
        database: "test character db",
        dialect: 'sqlite',
        storage: ":memory:"
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