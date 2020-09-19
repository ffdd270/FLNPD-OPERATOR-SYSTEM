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
        if ( params == null ) { return obj.error_string; }
        let item = await InventoryModel.GetTargetItemDocument( params, room_id, obj );
        if ( item == null ) { return "존재하지 않은 아이템에 설명을 바꾸려고 하고 있어. 이 아이템이 맞는 지 확인 해줘."; }

        let item_info = InventoryModel.GetNameOrDescriptionFromParams( params );
        item.desc = item_info.desc;

        await item.save();

        return `${item.name}의 설명이 변경 되었어.`;
    }

    static async AddItemToInventory( params : string | null, message : Message )
    {
        let room_id = await ModelUtil.GetRoomIdFromMessage( message );
        let obj = {
            error_string: `땡. 사용법은 !add_item <인벤토리 이름> <아이템 코드> <갯수?> 야. 갯수는 없으면 1이 들어가.`
        };

        if ( params == null ) { return obj.error_string; }
        
        obj.error_string = "존재하지 않은 아이템을 추가하려고 하고 있어. 이 아이템이 맞는 지 확인 해줘."
        let result = await InventoryModel.AddItemToInventoryDocument( params, room_id, obj );

        return `${result.target_id}에 ${result.item_id}(이)가 ${result.add_count}개 추가 되었어. 현재 수량은 ${result.result_count}개야.`;
    }

    static async DecItemToInventory( params : string | null, message : Message )
    {
        let room_id = await ModelUtil.GetRoomIdFromMessage( message );
        let obj = {
            error_string: `땡. 사용법은 !dec_item <인벤토리 이름> <아이템 코드> <갯수?> 야. 갯수는 없으면 1이 들어가.`
        };
        if ( params == null ) { return obj.error_string; }

        let inventory_item = await InventoryModel.GetInventoryDocument( params, room_id, obj );
        obj.error_string = "존재하지 않은 아이템을 삭제하려고 하고 있어. 이 아이템이 맞는 지 확인 해줘."

        if ( inventory_item == null ) { return obj.error_string; }

        let dec_count = InventoryModel.ParseItemCount( params );

        if ( inventory_item.item_count < dec_count )
        {
            return "보유한 아이템의 갯수보다 더 지우려고 시도 하고 있어. 수량을 다시 확인해줄래?";
        }

        if ( dec_count < 1 )
        {
            return "수량은 반드시 0보다는 커야해.";
        }

        let item_id = inventory_item.item_id;

        if ( inventory_item.item_count == dec_count )
        {
            await inventory_item.destroy();
            return `${item_id}의 보유량이 0가 되었어.`;
        }

        inventory_item.item_count -= dec_count;
        await inventory_item.save();

        return `${item_id}의 보유량이 ${inventory_item.item_count} 남았어.`;
    }

    static async ShowInventory( params : string | null, message : Message )
    {
        let room_id = await ModelUtil.GetRoomIdFromMessage(message);
        let obj = {
            error_string: `땡. 사용법은 !show_inven <인벤토리 이름> 야.`
        };

        if (params == null)
        {
            return obj.error_string;
        }

        let target_inventory_items = await InventoryModel.GetInventoryDocuments( params, room_id, obj );

        let target_name = InventoryModel.ParseTargetName( params, obj );
        let result_string = '';
        result_string += `여기. ${target_name}의 인벤토리.\n`;
        result_string += "```\n";
        for ( let inventory_item of target_inventory_items )
        {
            // TODO : SELECT 잘 때리는 방법을 까먹어서 바보처럼 돈다. 하지만 지금은 귀찮고, 100명 안 팠 시스템이니 나중에 수정하는 걸로..

            let item = await  ItemDocuments.findOne( {  where: { id: inventory_item.item_id, room_id: room_id }  }  );

            if ( item == null )
            {
                return "이런. 뭔가 잘못됐었어. KuroNeko에게 알려 주면 고쳐 줄게. Addition Info : ShowInventory, let -> of loop.";
            }

            result_string += `${item.name} : ${item.desc}  / ${inventory_item.item_count}개\n`;
        }

        result_string += "```";

        return result_string;
    }

    static addCommand( parser : Parser )
    {
        parser.addCallback( 'make_item', this.MakeItem );
        parser.addCallback( 'm_i', this.MakeItem );

        parser.addCallback( 'item_list', this.ItemList );
        parser.addCallback( 'i_l', this.ItemList );

        parser.addCallback( 'set_desc', this.SetDesc );
        parser.addCallback( 's_d', this.SetDesc );

        parser.addCallback( 'add_item', this.AddItemToInventory );
        parser.addCallback( 'a_i', this.AddItemToInventory );

        parser.addCallback( 'dec_item', this.DecItemToInventory );
        parser.addCallback( 'd_i', this.DecItemToInventory );

        parser.addCallback( "show_inven", this.ShowInventory);
        parser.addCallback( "s_i", this.ShowInventory);
    }
}