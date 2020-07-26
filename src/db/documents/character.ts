import {Table, Column, Model, DataType} from 'sequelize-typescript';

@Table
export class CharacterDocuments extends  Model<CharacterDocuments>
{
    @Column( { primaryKey: true, type: DataType.STRING } )
    id! : string;

    // Channel의 PK
    @Column( { primaryKey: true, type: DataType.STRING } )
    room_id! : string;

    @Column( DataType.TEXT )
    name! : string;

    @Column( { type: DataType.TEXT, allowNull: true } )
    comment? : string;

    @Column(DataType.INTEGER)
    hp_max! : number;

    @Column(DataType.INTEGER)
    hp! : number;

    @Column(DataType.INTEGER)
    sp_max! : number;

    @Column(DataType.INTEGER)
    sp! : number;

    @Column( DataType.DATE )
    create_tm! : Date;
}