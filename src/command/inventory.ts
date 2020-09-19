import {ModelUtil} from "../model/util";
import {InventoryModel} from "../model/inventory";
import {Message} from "discord.js";
import {ItemDocuments} from "../db/documents/item";
import {Parser} from "./parser";


export class InventoryCommands
{

    static async MakeItem( params : string | null, message : Message )
    {
        let room_id = await ModelUtil.GetRoomIdFromMessage( message );

        let obj = {
            error_string: `떙. 사용법은 !make_item "<아이템 이름>" "<설명?>" 이야.`
        };

        if ( params == null ) { return obj.error_string; }

        let item = await InventoryModel.GetTargetItemDocument( params, room_id, obj );
        if ( item != null ) { return "이미 존재하는 아이템이야. 설명을 바꾸려면 !set_desc 명령을 사용해줘."; }

        let item_info = InventoryModel.GetNameOrDescriptionFromParams( params );

        let new_item = new ItemDocuments( { id: item_info.item_id, name: item_info.item_id, room_id: room_id, desc: item_info.desc } )

        await new_item.save();

        return item_info.item_id + "(이)가 이 방에 생성되었어.";
    }

    static async ItemList( params : string | null, message : Message )
    {
        let room_id = await ModelUtil.GetRoomIdFromMessage( message );
        let items = await InventoryModel.GetItemDocuments( room_id );

        let result_string = ''
        result_string += "여기. 이 방에 존재하는 아이템들의 목록이야.\n";

        result_string += "```\n";

        for ( let item of items )
        {
            result_string += `${item.name} : ${item.desc}\n`;
        }

        result_string += "```\n";

        return result_string;
    }

    static async SetDesc( params : string | null, message : Message )
    {
        let room_id = await ModelUtil.GetRoomIdFromMessage( message );

        let obj = {
            error_string: `땡. 사용법은 !set_desc "<아이템 이름>" "<설명?>" 이야. 설명을 비워 놓으면, 설명이 비워져.`
        }
        if ( params == null ) { return "이런. 명령이 이상한 것 같은데."; }
        let item = await InventoryModel.GetTargetItemDocument( params, room_id, obj );
        if ( item == null ) { return "존재하지 않은 아이템에 설명을 바꾸려고 하고 있어. 이 아이템이 맞는 지 확인해줄래?"; }

        let item_info = InventoryModel.GetNameOrDescriptionFromParams( params );
        item.desc = item_info.desc;

        await item.save();

        return `${item.name}의 설명이 변경 되었어.`;
    }

    static addCommand( parser : Parser )
    {
        parser.addCallback( 'make_item', this.MakeItem );
        parser.addCallback( 'item_list', this.ItemList );
        parser.addCallback( 'set_desc', this.SetDesc );
    }
}