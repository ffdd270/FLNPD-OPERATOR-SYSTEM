import {Table, Column, Model, DataType} from 'sequelize-typescript';

@Table
export class ChannelDocuments extends  Model<ChannelDocuments>
{
    @Column( { primaryKey: true, type: DataType.STRING } )
    channel_id! : string;

    @Column( DataType.TEXT )
    room_id! : string;

    @Column( DataType.DATE )
    create_tm! : Date;
}