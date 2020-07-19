import {Parser} from "./parser";
import {CharacterDocuments} from "../db/model/character";
import {Model} from "sequelize-typescript";

export class CharacterCommand
{
    static unit_and_number_regex = /^"(.+)"\s(\d+)/;

    static async AddActor( params : string | null )
    {
        let error_string = 'ERROR! 사용법 : !add_actor "<캐릭터 이름>"';
        if ( params == null ) { return error_string; }

        let regex = /^"(.+)"$/
        let add_actor_param = regex.exec( params );

        if( add_actor_param == null ) {  return error_string; }
        let name = add_actor_param[1];

        let find =  await CharacterDocuments.findOne( { where: { id: name } } );
        if( find != null )
        {
            return name + " 은 이미 있습니다.";
        }

        let character = new CharacterDocuments(  { id: name, name: name, hp: 5 } );
        await character.save(); // 저장하고 간다.
        return name + "를 생성하였습니다!";
    }

    static async SetHp( params : string | null )
    {
        let error_string = 'ERROR! 사용법 : !set_hp "<캐릭터 이름>" <HP> # 오퍼레이터만 쓰세요.';
        if ( params == null ) { return error_string; }

        let set_hp_param = CharacterCommand.unit_and_number_regex.exec( params );
        if ( set_hp_param == null ) { return error_string; }

        let character_doc = await CharacterDocuments.findOne( { where: { id: set_hp_param[1] } })
        if( character_doc == null ) { return "존재하지 않는 캐릭터입니다!"; }

        character_doc.hp = Number.parseInt( set_hp_param[2] );
        await character_doc.save();

        return character_doc.name + "의 체력이 " + character_doc.hp + "가 되었습니다.";
    }

    static async Attack( params : string | null )
    {
        let error_string = 'ERROR! 사용법 : !attack <공격할 사람> <데미지>';

        if( params == null ) { return error_string; }

        let attack_param = CharacterCommand.unit_and_number_regex.exec( params );

        if( attack_param == null ) { return error_string; }

        let target = attack_param[1];

        let dmg = Number.parseInt( attack_param[2] );
        let character_doc = await CharacterDocuments.findOne(  { where: { id : target } } );

        if( character_doc == null ) { return "ERROR : 존재하지 않는 캐릭터입니다."; }

        character_doc.hp -= dmg;
        let after = character_doc.hp;

        character_doc.save();

        return "공격! " + dmg + "데미지. 남은 체력 : " + after;
    }

    static async GetStatus(  )
    {
        let character_docs = await CharacterDocuments.findAll();
        let result_string = "";

        for( let doc of character_docs )
        {
            result_string +=  doc.name + " / 남은 체력 : " + doc.hp + "\n";
        }

        result_string = result_string == "" ?  "캐릭터가 존재하지 않습니다!" : result_string;

        return result_string;
    }

    static async Drop()
    {
        let character_docs : Model<CharacterDocuments>[]  = await CharacterDocuments.findAll();

        if ( character_docs == null ) { return ""; }

        await CharacterDocuments.destroy( { where: { } } );

        return "캐릭터가 모두 삭제되었습니다.";
    }

    static addCommand( parser : Parser )
    {
        parser.addCallback( 'add', this.AddActor );
        parser.addCallback( "set_hp", this.SetHp );
        parser.addCallback( 'attack', this.Attack );
        parser.addCallback( 'status', this.GetStatus );
        parser.addCallback( 'DROP_ALL', this.Drop );
    }
}
