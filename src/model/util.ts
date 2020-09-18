import {ChannelDocuments} from "../db/documents/channel";
import {Message} from "discord.js";

export class ModelUtil
{
    static NoRoomError : string = `이런. 이 채널엔 방이 없네. !use_room "<방_이름>"으로 하나 만들어 보는 건 어때?`;

    static async GetRoomIdFromMessage( message : Message ) : Promise<string>
    {
        let channel = await ChannelDocuments.findOne( { where: { channel_id: message.channel.id }} );

        if(channel == null)
        {
            throw { error_string: ModelUtil.NoRoomError };
        }

        return channel.room_id;
    }
}