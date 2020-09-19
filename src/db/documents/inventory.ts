import {Table, Column, Model, DataType} from 'sequelize-typescript';

@Table
export class InventoryDocuments extends  Model<InventoryDocuments>
{
    @Column( { primaryKey: true, type: DataType.STRING } )
    id! : string;

    @Column( { primaryKey: true, type: DataType.STRING })
    room_id!: string;

    @Column( { primaryKey: true,  type: DataType.STRING } )
    item_id! : string; // ItemDocuments의 id.

    @Column( { type: DataType.INTEGER  } )
    item_count! : number;
}