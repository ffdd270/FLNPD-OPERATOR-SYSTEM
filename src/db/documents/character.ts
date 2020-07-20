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

    @Column(DataType.INTEGER)
    hp! : number;

    @Column( DataType.DATE )
    create_tm! : Date;
}