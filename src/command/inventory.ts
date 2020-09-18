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
            error_string: `떙. 사용법은 !make_item <아이템 이름> <설명?> 이야.`
        };

        if ( params == null ) { return obj.error_string; }

        let item = await InventoryModel.GetTargetItemDocument( params, room_id, obj );
        if ( item != null ) { return "이미 존재하는 아이템이야. 설명을 바꾸려면 !set_desc 명령을 사용해줘."; }

        let item_info = InventoryModel.GetNameOrDescriptionFromParams( params );

        let new_item = new ItemDocuments( { id: item_info.item_id, name: item_info.item_id, room_id: room_id, desc: item_info.desc } )

        await new_item.save();

        return item_info.item_id + "(이)가 이 방에 생성되었어.";
    }

    static addCommand( parser : Parser )
    {
        parser.addCallback( 'make_item', this.MakeItem );
    }
}