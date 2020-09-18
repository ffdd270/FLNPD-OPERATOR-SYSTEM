import {Message} from "discord.js";
import {CharacterDocuments} from "../db/documents/character";
import {ModelUtil} from  "./util";

export class CharacterModel
{
    static NoRoomError : string = `이런. 이 채널엔 방이 없네. !use_room "<방_이름>"으로 하나 만들어 보는 건 어때?`;
    static NoCharacterError : string  = `그런 캐릭터는 못 찾았어.`;
    static UnitFindRegex = /^"(.+)"/;
    static UnitAndNumberRegex = /^"(.+)"\s+(\d+)$/;
    static UnitAndStringRegex = /^"(.+)"\s+"(.+)"$/;

    static async GetRoomIdFromMessage( message : Message ) : Promise<string>
    {
        return ModelUtil.GetRoomIdFromMessage( message );
    }

    static async GetTargetDocumentByRegexResult( regex_result : RegExpExecArray, room_id : string, ref: { error_string: string } ) : Promise<CharacterDocuments | null>
    {
        let character_doc = await CharacterDocuments.findOne( { where: { id: regex_result[1], room_id: room_id } })
        if( character_doc == null )
        {
            ref.error_string = CharacterModel.NoCharacterError;
            return null;
        }

        return character_doc;
    }


    // Hp, Sp 포인트 지정될 때.
    static async GetTargetDocument(  params : string | null, room_id : string, ref: { error_string : string } ) : Promise<CharacterDocuments | null>
    {
        if ( params == null ) { return null; }

        let regex_result = CharacterModel.UnitFindRegex.exec( params );
        if ( regex_result == null ) { return null; }

        return await CharacterModel.GetTargetDocumentByRegexResult( regex_result, room_id, ref );
    }


    static GetParam( params : string | null, regex : RegExp, error_obj : { error_string: string } )
    {
        if (params == null)
        {
            throw error_obj;
        }

        let reg_result = regex.exec(params);
        if (reg_result == null)
        {
            throw error_obj;
        }

        return reg_result;
    }

    static GetParamsForPointArguments(params : string | null, error_obj : { error_string: string } )
    {
        return CharacterModel.GetParam( params, CharacterModel.UnitAndNumberRegex, error_obj );
    }

    static GetParamsForStringArguments(params : string | null, error_obj: { error_string: string } )
    {
        return CharacterModel.GetParam( params, CharacterModel.UnitAndStringRegex, error_obj );
    }

    static GetPointValue(params : string | null, error_obj : {  error_string : string } )
    {
        let point_regex_result = CharacterModel.GetParamsForPointArguments( params, error_obj );
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


    static GetTargetName( params : string ) : string
    {
        let result = CharacterModel.UnitFindRegex.exec( params );
        if ( result == null )
        {
            throw { error_string: "BUG" };
        }

        return result[1];
    }

}