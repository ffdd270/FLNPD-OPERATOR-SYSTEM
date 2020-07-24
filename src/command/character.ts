import {Parser} from "./parser";
import {CharacterDocuments} from "../db/documents/character";
import {Message} from "discord.js";
import {CharacterModel} from "../model/character";

export class CharacterCommands
{
    static unit_and_number_regex = /^"(.+)"\s(\d+)/;
    static percent_regex =  /\d*\.?\d?\d/;

    static async AddActor( params : string | null, message : Message )
    {
        let room_id = await CharacterModel.GetRoomIdFromMessage( message );
        if( room_id == null ) { return CharacterModel.NoRoomError; }

        let error_string = '땡. 사용법은 !add "<캐릭터 이름>" 야,';
        if ( params == null ) { return error_string; }

        let regex = /^"(.+)"$/
        let add_actor_param = regex.exec( params );

        if( add_actor_param == null ) {  return error_string; }
        let name = add_actor_param[1];

        let find =  await CharacterDocuments.findOne( { where: { id: name, room_id: room_id } } );
        if( find != null )
        {
            return name + "은(는) 이미 있어.";
        }

        let character = new CharacterDocuments(  { id: name, room_id: room_id ,name: name,
            hp: 5, hp_max: 5, sp: 0, sp_max: 0 } );

        await character.save(); // 저장하고 간다.

        return name + "을(를) 만들었어.";
    }

    static async SetHp( params : string | null, message : Message )
    {
        let room_id = await CharacterModel.GetRoomIdFromMessage( message );
        if( room_id == null ) { return CharacterModel.NoRoomError; }

        let error_string = '땡. 사용법은 !set_hp "<캐릭터 이름>" <HP> 야. 오퍼레이터만 쓰는 게 좋을 것 같아.';
        if ( params == null ) { return error_string; }

        let set_hp_param = CharacterCommands.unit_and_number_regex.exec( params );
        if ( set_hp_param == null ) { return error_string; }

        let character_doc = await CharacterDocuments.findOne( { where: { id: set_hp_param[1], room_id: room_id } })
        if( character_doc == null ) { return CharacterModel.NoCharacterError; }

        let hp_max = Number.parseInt( set_hp_param[2] );
        character_doc.hp = hp_max;
        character_doc.hp_max = hp_max;

        await character_doc.save();

        return character_doc.name + "의 최대 체력과 채력이 " + character_doc.hp_max + "이 되었어.";
    }


    static async Attack( params : string | null, message : Message  )
    {
        let room_id = await CharacterModel.GetRoomIdFromMessage( message );
        if( room_id == null ) { return CharacterModel.NoRoomError; }

        let error_string = '땡. 사용법은  !attack <공격할 사람> <데미지> 야.';

        if( params == null ) { return error_string; }

        let attack_param = CharacterCommands.unit_and_number_regex.exec( params );

        if( attack_param == null ) { return error_string; }

        let target = attack_param[1];

        let dmg = Number.parseInt( attack_param[2] );
        let character_doc = await CharacterDocuments.findOne(  { where: { id : target, room_id: room_id } } );

        if( character_doc == null ) { return CharacterModel.NoCharacterError; }

        character_doc.hp -= dmg;
        let after = character_doc.hp;

        character_doc.save();

        let hp_max = character_doc.hp_max == null || character_doc.hp_max == 0 ? 1 : character_doc.hp_max;
        let percent = ( character_doc.hp / hp_max ) * 100;
        let percent_regex  = CharacterCommands.percent_regex.exec( percent.toString() );
        let percent_string = percent_regex ? percent_regex[0] : "ERROR_PERCENT" ;

        return character_doc.name + "은(는) " + dmg + "데미지를 받았고, 체력은 " + after + "(" + percent_string + "%) 남았어.";
    }

    static async GetStatus( params : string | null, message : Message )
    {
        let room_id = await CharacterModel.GetRoomIdFromMessage( message );
        if( room_id == null ) { return CharacterModel.NoRoomError; }

        let character_docs = await CharacterDocuments.findAll( { where: { room_id: room_id } });
        let result_string = "";

        for( let doc of character_docs )
        {
            let hp_max = doc.hp_max == null || doc.hp_max == 0 ? 1 : doc.hp_max;
            let percent = ( doc.hp / hp_max ) * 100;
            let percent_string = CharacterCommands.percent_regex.exec( percent.toString() );

            let sp_max = doc.sp_max == null || doc.sp_max == 0 ? 1 : doc.sp_max;
            let sp_percent = ( doc.sp / sp_max ) * 100;
            let sp_percent_string = CharacterCommands.percent_regex.exec( sp_percent.toString() );

            result_string += doc.name + " : HP " + doc.hp + "/" + doc.hp_max + "(" + percent_string + "%)" + ","
                + " SP " + doc.sp + "/" + doc.sp_max + "(" + sp_percent_string + "%)" + "\n";
        }

        result_string = result_string == "" ?  "캐릭터가 없어." : result_string + "이상. 보고 끝.";
        return result_string;
    }

    static async DropAll(params : string | null, message : Message )
    {
        let room_id = await CharacterModel.GetRoomIdFromMessage( message );
        if( room_id == null ) { return CharacterModel.NoRoomError; }

        await CharacterDocuments.destroy( { where: { room_id: room_id } } );

        return "야호! 캐릭터를 모두 날려 버렸어!";
    }

    static addCommand( parser : Parser )
    {
        parser.addCallback( 'add', this.AddActor );
        parser.addCallback( "set_hp", this.SetHp );
        parser.addCallback( 'attack', this.Attack );
        parser.addCallback( 'status', this.GetStatus );
        parser.addCallback( 'DROP_ALL', this.DropAll );
    }
}
