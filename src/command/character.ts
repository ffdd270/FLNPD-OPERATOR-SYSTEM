import {Parser} from "./parser";
import {CharacterDocuments} from "../db/documents/character";
import {Message} from "discord.js";
import {CharacterModel} from "../model/character";

export class CharacterCommands
{
    static UnitAndNumberRegex = /^"(.+)"\s(\d+)/;
    static percent_regex =  /\d*\.?\d?\d/;

    static async AddActor( params : string | null, message : Message )
    {
        let room_id = await CharacterModel.GetRoomIdFromMessage( message );

        let obj = {
            error_string: `땡. 사용법은 !add "<캐릭터 이름>" 야,`
        };

        if ( params == null ) { return obj.error_string; }

        let find = await CharacterModel.GetTargetDocument( params, room_id, obj );
        let name = CharacterModel.GetTargetName( params );

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

        let obj = {
            error_string: `땡. 사용법은 !set_hp "<캐릭터 이름>" <HP> 야. 오퍼레이터만 쓰는 게 좋을 것 같아.`
        };

        let hp_max = CharacterModel.GetPointValue( params, obj );

        let character_doc = await CharacterModel.GetTargetDocument( params, room_id, obj );
        if ( character_doc == null ) { return obj.error_string;  }

        character_doc.hp = hp_max;
        character_doc.hp_max = hp_max;

        await character_doc.save();

        return character_doc.name + "의 최대 체력과 채력이 " + character_doc.hp_max + "이 되었어.";
    }


    static async Attack( params : string | null, message : Message  )
    {
        let room_id = await CharacterModel.GetRoomIdFromMessage( message );

        let obj = {
            error_string: `땡. 사용법은  !attack <공격할 사람> <데미지> 야.`
        };

        if( params == null ) { return obj.error_string; }

        let character_doc = await CharacterModel.GetTargetDocument( params, room_id, obj );
        if( character_doc == null ) { return CharacterModel.NoCharacterError; }

        let dmg = CharacterModel.GetPointValue( params, obj );

        character_doc.hp -= dmg;
        character_doc.hp = Math.min( character_doc.hp,  character_doc.hp_max ); // 최소 값 보정.

        let after = character_doc.hp;

        character_doc.save();

        let hp_max = character_doc.hp_max == null || character_doc.hp_max == 0 ? 1 : character_doc.hp_max;
        let percent = ( character_doc.hp / hp_max ) * 100;
        let percent_regex  = CharacterCommands.percent_regex.exec( percent.toString() );
        let percent_string = percent_regex ? percent_regex[0] : "ERROR_PERCENT" ;

        let after_string = "체력은 " + after + "(" + percent_string + "%) 남았어.";

        if( character_doc.hp <= 0 )
        {
            after_string = "무력화되었어.";
        }

        return character_doc.name + "은(는) " + dmg + "데미지를 받았고, " + after_string;
    }


    static async SetMaxSkillPoint(  params : string | null, message : Message )
    {
        let room_id = await CharacterModel.GetRoomIdFromMessage( message );

        let obj = {
            error_string: `땡. 사용법은 !set_sp "<캐릭터_이름>" <최대SP> 야.`
        };

        let set_sp = CharacterModel.GetPointValue( params, obj );

        let character_doc = await CharacterModel.GetTargetDocument( params, room_id, obj );
        if( character_doc == null ) { return obj.error_string; }

        character_doc.sp_max = set_sp;
        character_doc.sp = set_sp;

        character_doc.save();

        return character_doc.name + "의 최대 SP가 "  + character_doc.sp_max + "이 되었어.";
    }

    static async GainSkillPoint(  params : string | null, message : Message )
    {
        let room_id = await CharacterModel.GetRoomIdFromMessage( message );

        let obj = {
            error_string: `땡. 사용법은 !gain "<캐릭터_이름>" <얻을_SP> 야.`
        };

        let sp_params = CharacterModel.GetParamsForPointArguments( params, obj );

        let character_doc = await CharacterModel.GetTargetDocument( params, room_id, obj );
        if( character_doc == null ) { return obj.error_string; }

        let sp = Number.parseInt( sp_params[2] );
        CharacterModel.AddSp( character_doc, sp, obj );

        return character_doc.name + "은(는) " + sp +  "을 얻었어. 현재 SP는 " + character_doc.sp + "이야.";
    }

    static async UseSkillPoint( params : string | null, message : Message   )
    {
        let room_id = await CharacterModel.GetRoomIdFromMessage( message );

        let obj = {
            error_string: `땡. 사용법은 !use "<캐릭터_이름>" <사용_SP> 야.`
        };

        let sp_args = CharacterModel.GetParamsForPointArguments( params, obj );
        let character_doc = await CharacterModel.GetTargetDocument( params, room_id, obj );
        if( character_doc == null ) { return obj.error_string; }

        let sp = Number.parseInt( sp_args[2] );
        let ok = CharacterModel.AddSp( character_doc, -sp, obj );

        if ( ok )
        {
            return character_doc.name + "은(는) " + sp +  " SP를 사용 했어. 남은 SP는 " + character_doc.sp + "이야.";
        }
        else
        {
            return character_doc.name + "은(는) " + sp +  " SP를 사용 하려고 했지만 SP가 부족 했어. 현재 SP는 " + character_doc.sp + "이야.";
        }
    }

    static async AddComment(params: string | null, message: Message)
    {
        let room_id = await CharacterModel.GetRoomIdFromMessage( message );

        let obj = {
            error_string: `땡. 사용법은 !comment "<캐릭터-이름>" "<할말>" 야.`
        };

        let comments_args = CharacterModel.GetParamsForStringArguments( params, obj );
        let character_doc = await CharacterModel.GetTargetDocumentByRegexResult( comments_args, room_id, obj );
        if ( character_doc == null ) { return obj.error_string; }

        character_doc.comment = comments_args[2];
        character_doc.save();

        return character_doc.name + "에 코맨트, \"" + character_doc.comment + "\"가 추가 되었어.";
    }

    static async RemoveComment(params: string | null, message: Message)
    {
        let room_id = await CharacterModel.GetRoomIdFromMessage( message );

        let obj = {
            error_string: `땡. 사용법은 !remove_comment "<캐릭터-이름>" 야.`
        };

        let character_doc = await CharacterModel.GetTargetDocument( params, room_id, obj );
        if ( character_doc == null ) { return obj.error_string; }

        character_doc.comment = "";
        character_doc.save();

        return character_doc.name + "의 코맨트가 삭제 되었어.";
    }
    static async GetStatus( params : string | null, message : Message )
    {
        let room_id = await CharacterModel.GetRoomIdFromMessage( message );

        let character_docs = await CharacterDocuments.findAll( { where: { room_id: room_id } } );
        let result_string = "";

        for( let doc of character_docs )
        {
            let hp_max = doc.hp_max == null || doc.hp_max == 0 ? 1 : doc.hp_max;
            let percent = doc.hp > 0 ? ( doc.hp / hp_max ) * 100 : 0;
            let percent_string = CharacterCommands.percent_regex.exec( percent.toString() );

            let sp_max = doc.sp_max == null || doc.sp_max == 0 ? 1 : doc.sp_max;
            let sp_percent = ( doc.sp / sp_max ) * 100;
            let sp_percent_string = CharacterCommands.percent_regex.exec( sp_percent.toString() );

            let dead_string = doc.hp > 0 ? "" : " 무력화. ";
            let comment = doc.comment == undefined || doc.comment == "" ? " " : doc.comment + " ";

            result_string += `${doc.name} : HP ${doc.hp}/${doc.hp_max}(${percent_string}%), SP ${doc.sp}/${doc.sp_max}(${sp_percent_string}%), ${comment} ${dead_string}\n`;
        }

        result_string = result_string == "" ?  "캐릭터가 없어." : result_string + "이상. 보고 끝.";
        return result_string;
    }

    static  async Kill(params : string | null, message : Message )
    {
        if( params == null ) { return "파라미터 오류야."; }
        let room_id = await CharacterModel.GetRoomIdFromMessage( message );
        let target_name = CharacterModel.GetTargetName( params );

        let char = await  CharacterDocuments.findOne( { where: { room_id: room_id, id: target_name } } );

        if( char == null ) { return "" }

        await CharacterDocuments.destroy( { where: { room_id: room_id, id: target_name } } );

        return "캐릭터를 날려 버렸어!";
    }

    static async KillAll(params : string | null, message : Message )
    {
        let room_id = await CharacterModel.GetRoomIdFromMessage( message );

        await CharacterDocuments.destroy( { where: { room_id: room_id } } );

        return "캐릭터를 모두 날려 버렸어!";
    }

    static addCommand( parser : Parser )
    {
        parser.addCallback( 'add', this.AddActor );
        parser.addCallback( 'ad', this.AddActor );

        parser.addCallback( "set_hp", this.SetHp );
        parser.addCallback( "s_h", this.SetHp );

        parser.addCallback( 'attack', this.Attack );
        parser.addCallback( 'ak', this.Attack );

        parser.addCallback( 'status', this.GetStatus )
        parser.addCallback( 's', this.GetStatus );

        parser.addCallback( 'KILL_ALL', this.KillAll );

        parser.addCallback( 'KILL', this.Kill );
        parser.addCallback( 'K', this.Kill );

        //sp
        parser.addCallback( 'gain', this.GainSkillPoint );
        parser.addCallback( 'g', this.GainSkillPoint );

        parser.addCallback( 'use', this.UseSkillPoint );
        parser.addCallback( 'use', this.UseSkillPoint );

        parser.addCallback( 'set_sp', this.SetMaxSkillPoint );
        parser.addCallback( 's_s', this.SetMaxSkillPoint );

        //comments
        parser.addCallback( 'comment', this.AddComment );
        parser.addCallback( 'c', this.AddComment );

        parser.addCallback( 'remove_comment', this.RemoveComment );
        parser.addCallback( 'r_c', this.RemoveComment );
    }
}
