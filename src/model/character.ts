import {ChannelDocuments} from "../db/documents/channel";
import {Message} from "discord.js";

export class CharacterModel
{
    static NoRoomError : string = `이런. 이 채널엔 방이 없네. !use "<방_이름>"으로 하나 만들어 보는 건 어때?`;
    static NoCharacterError : string  = `그런 캐릭터는 못 찾았어.`;

    static async GetRoomIdFromMessage( message : Message ) : Promise<string | null>
    {
        let channel = await ChannelDocuments.findOne( { where: { channel_id: message.channel.id }} );

        if(channel == null)
        {
            return null;
        }

        return channel.room_id;
    }
}