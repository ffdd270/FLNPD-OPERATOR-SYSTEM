import {Table, Column, Model, DataType} from 'sequelize-typescript';

@Table
export class ItemDocuments extends  Model<ItemDocuments>
{
    @Column( { primaryKey: true, type: DataType.STRING } )
    id! : string;

    @Column( { primaryKey: true, type: DataType.STRING })
    room_id!: string;

    @Column( { type: DataType.STRING } )
    name! : string;

    @Column( { type: DataType.STRING } )
    desc! : string;
}