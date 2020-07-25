import {ChannelDocuments} from "../db/documents/channel";
import {Message} from "discord.js";
import {CharacterDocuments} from "../db/documents/character";

export class CharacterModel
{
    static NoRoomError : string = `이런. 이 채널엔 방이 없네. !use "<방_이름>"으로 하나 만들어 보는 건 어때?`;
    static NoCharacterError : string  = `그런 캐릭터는 못 찾았어.`;
    static UnitFindRegex = /^"(.+)"/;
    static UnitAndNumberRegex = /^"(.+)"\s(\d+)/;

    static async GetRoomIdFromMessage( message : Message ) : Promise<string>
    {
        let channel = await ChannelDocuments.findOne( { where: { channel_id: message.channel.id }} );

        if(channel == null)
        {
            throw { error_message: CharacterModel.NoRoomError };
        }

        return channel.room_id;
    }

    // Hp, Sp 포인트 지정될 때.
    static async GetTargetDocument(  params : string | null, room_id : string, ref: { error_string : string } ) : Promise<CharacterDocuments | null>
    {
        if ( params == null ) { return null; }

        let regex_result = CharacterModel.UnitFindRegex.exec( params );
        if ( regex_result == null ) { return null; }

        let character_doc = await CharacterDocuments.findOne( { where: { id: regex_result[1], room_id: room_id } })
        if( character_doc == null )
        {
            ref.error_string = CharacterModel.NoCharacterError;
            return null;
        }

        return character_doc;
    }

    static CheckParamsForPointArguments(  params : string | null, error_obj : { error_string: string } ) : RegExpExecArray
    {
        if (params == null)
        {
            throw error_obj;
        }

        let set_param = CharacterModel.UnitAndNumberRegex.exec(params);
        if (set_param == null)
        {
            throw error_obj;
        }

        return set_param;
    }

    static GetPointValue(params : string | null, error_obj : {  error_string : string } )
    {
        let point_regex_result = CharacterModel.CheckParamsForPointArguments( params, error_obj );
        return Number.parseInt( point_regex_result[2] );
    }

    static AddSp( character_doc : CharacterDocuments, add_sp : number, error_obj : { error_string : string } ) : boolean
    {
        if ( character_doc.sp + add_sp < 0 ) //  0 언더?
        {
            return false;
        }

        character_doc.sp += add_sp;
        character_doc.sp = Math.min( character_doc.sp_max, character_doc.sp );

        character_doc.save();
        return true;
    }



    static GetTargetName( params : string ) : string | null
    {
        let result = CharacterModel.UnitFindRegex.exec( params );
        if ( result == null ) { return null; }

        return result[1];
    }

}