import {Parser} from "./parser";
import {CharacterDocuments} from "../db/documents/character";
import {Message} from "discord.js";
import {CharacterModel} from "../model/character";

export class CharacterCommand
{
    static unit_and_number_regex = /^"(.+)"\s(\d+)/;

    static async AddActor( params : string | null, message : Message )
    {
        let room_id = await CharacterModel.GetRoomIdFromMessage( message );
        if( room_id == null ) { return CharacterModel.NoRoomError; }

        let error_string = '땡. 사용법은 !add_actor "<캐릭터 이름>" 야,';
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

        let character = new CharacterDocuments(  { id: name, room_id: room_id ,name: name, hp: 5 } );
        await character.save(); // 저장하고 간다.
        return name + "를 만들었어!";
    }

    static async SetHp( params : string | null, message : Message )
    {
        let room_id = await CharacterModel.GetRoomIdFromMessage( message );
        if( room_id == null ) { return CharacterModel.NoRoomError; }

        let error_string = '땡. 사용법은 !set_hp "<캐릭터 이름>" <HP> 야. 오퍼레이터만 쓰는 게 좋을 것 같아.';
        if ( params == null ) { return error_string; }

        let set_hp_param = CharacterCommand.unit_and_number_regex.exec( params );
        if ( set_hp_param == null ) { return error_string; }

        let character_doc = await CharacterDocuments.findOne( { where: { id: set_hp_param[1], room_id: room_id } })
        if( character_doc == null ) { return CharacterModel.NoCharacterError; }

        character_doc.hp = Number.parseInt( set_hp_param[2] );
        await character_doc.save();

        return character_doc.name + "의 체력이 " + character_doc.hp + "가 되었어.";
    }


    static async Attack( params : string | null, message : Message  )
    {
        let room_id = await CharacterModel.GetRoomIdFromMessage( message );
        if( room_id == null ) { return CharacterModel.NoRoomError; }

        let error_string = '땡. 사용법은  !attack <공격할 사람> <데미지> 야.';

        if( params == null ) { return error_string; }

        let attack_param = CharacterCommand.unit_and_number_regex.exec( params );

        if( attack_param == null ) { return error_string; }

        let target = attack_param[1];

        let dmg = Number.parseInt( attack_param[2] );
        let character_doc = await CharacterDocuments.findOne(  { where: { id : target, room_id: room_id } } );

        if( character_doc == null ) { return CharacterModel.NoCharacterError; }

        character_doc.hp -= dmg;
        let after = character_doc.hp;

        character_doc.save();

        return character_doc.name + "은(는) " + dmg + "데미지를 받았고, 체력은 " + after + " 남았어.";
    }

    static async GetStatus( params : string | null, message : Message )
    {
        let room_id = await CharacterModel.GetRoomIdFromMessage( message );
        if( room_id == null ) { return CharacterModel.NoRoomError; }

        let character_docs = await CharacterDocuments.findAll( { where: { room_id: room_id } });
        let result_string = "";

        for( let doc of character_docs )
        {
            result_string +=  doc.name + " / 남은 체력 : " + doc.hp + "\n";
        }

        result_string = result_string == "" ?  "엇. 캐릭터가 없어." : result_string + " 이상. 보고 끝! ";
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
