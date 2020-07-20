import {Parser} from "./parser";
import {Message} from 'discord.js';

import {ChannelDocuments} from "../db/documents/channel";

export class ChannelCommand
{
    static param_check_regex = /^"(.+)"$/;
    // 방 생성
    static async UseRoom( params : string | null, message : Message )
    {
        let error_message = ` 땡. 사용법은 !use_room "<방_이름>" 이야. `;
        if( params == null ) { return error_message; }

        let param = ChannelCommand.param_check_regex.exec( params );
        if( param == null ) { return error_message; }

        let channel = await ChannelDocuments.findOne( { where: { channel_id: message.channel.id } } );

        if ( channel == null )
        {
             channel = await ChannelDocuments.create( { channel_id: message.channel.id } );
        }

        if( channel == null ) { return ""; }

        channel.room_id = param[1];
        await channel.save();

        return "좋아. 지금부터 이 채널은 방 \'" + channel.room_id + "\'을 사용해.";
    }


    static async WhatRoom( params : string | null, message : Message )
    {
        let channel = await ChannelDocuments.findOne( { where: { channel_id: message.channel.id } } );

        if ( channel == null )
        {
            return "이런! 이 채널은 방을 사용하고 있지 않아.";
        }

        return "좋아. 이 채널은 방 \'" + channel.room_id + "\'을 쓰고 있어.";
    }

    static addCommand( parser : Parser )
    {
        parser.addCallback( "use_room", this.UseRoom );
        parser.addCallback( "what_room", this.WhatRoom );
    }
}