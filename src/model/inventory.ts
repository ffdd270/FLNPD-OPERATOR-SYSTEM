import {ItemDocuments} from "../db/documents/item";
import {InventoryDocuments} from "../db/documents/inventory";


type AddItemResult = { target_id : string, item_id : string ,add_count : number, result_count : number  };


export class InventoryModel
{
    static OptionalMakeItemCommandRegex = /^"(.+)"/;
    static GetTargetRegex = /^"([^"]+)"/;
    static GetOptionalDescRegex = /"[ ]+"(.+)"/;
    static NoItemError = "그런 아이템은 없어.";

    static GetItemToInventoryRegex = /"([^"]+)"\s+"([^"]+)"/;
    static GetItemCountFromInventoryRegex = /"[^"]+"\s+"[^"]+"\s+(\d+)/;

    static async GetTargetItemDocumentByRegex(  regex_result : RegExpExecArray, room_id : string, error_handler : { error_string : string } ) : Promise<ItemDocuments | null>
    {
        let item_doc = await ItemDocuments.findOne( { where: { id: regex_result[1], room_id: room_id } });

        if ( item_doc == null )
        {
            error_handler.error_string = InventoryModel.NoItemError;
            return null;
        }

        return item_doc;

    }

    static async GetTargetItemDocument(  params : string | null, room_id : string, error_handler : { error_string : string } ) : Promise<ItemDocuments | null>
    {
        if ( params == null ) { throw error_handler; }

        let regex_result = InventoryModel.GetTargetRegex.exec( params );
        if ( regex_result == null ) { throw error_handler; }

        return await InventoryModel.GetTargetItemDocumentByRegex( regex_result, room_id, error_handler );
    }

    static GetItemDocuments( room_id : string ) : Promise<ItemDocuments[]>
    {
        return ItemDocuments.findAll({where: {room_id: room_id}});
    }


    static GetNameOrDescriptionFromParams( params : string ) : { item_id : string, desc : string }
    {
        let obj = { item_id: 'temp', desc : "" };
        let item = InventoryModel.GetTargetRegex.exec( params );

        if (item == null) { throw { error_string: "이런. 여기는 원래 망가지면 안 되는 곳인데. KuroNeko한테 알려 주면 좋겠어! 추가 정보 : GetNameOrDescriptionFromParams" }; }
        obj.item_id = item[1];

        let desc = InventoryModel.GetOptionalDescRegex.exec( params );
        if ( desc == null ) { return obj; }

        obj.desc = desc[1];
        return obj;
    }

    static async GetInventoryDocuments( params : string, room_id : string, error_handler : { error_string : string } ) : Promise<InventoryDocuments[]>
    {
        let inventory_id = InventoryModel.GetTargetRegex.exec( params );
        if ( inventory_id == null ) { throw error_handler; }

        return InventoryDocuments.findAll( { where: { id: inventory_id, room_id: room_id } } )
    }

    static ParseTargetName( params : string, error_handler : { error_string : string } )
    {
        let regex_result = InventoryModel.GetTargetRegex.exec(params);

        if ( regex_result == null )
        {
            throw error_handler;
        }

        return regex_result[1];
    }

    static async GetInventoryDocument( params : string, room_id : string, error_handler : { error_string : string } ) : Promise<InventoryDocuments | null>
    {
        let regex_result = InventoryModel.GetItemToInventoryRegex.exec( params );
        if ( regex_result == null ) { throw error_handler; }

        let target_id = regex_result[1];
        let item_id = regex_result[2];

        return InventoryDocuments.findOne( { where: { id: target_id, room_id: room_id, item_id: item_id } } );
    }

    static ParseItemCount( params : string, default_value : number = 1 )
    {
        let count = default_value;
        let parse_count = InventoryModel.GetItemCountFromInventoryRegex.exec( params );

        if ( parse_count != null )
        {
            count = Number.parseInt( parse_count[1] );
        }

        return count;
    }

    static async AddItemToInventoryDocument(params : string, room_id : string, error_handler : { error_string : string } ) : Promise<AddItemResult>
    {
        let regex_result = InventoryModel.GetItemToInventoryRegex.exec( params );
        if ( regex_result == null ) { throw error_handler; }

        let target_id = regex_result[1];
        let item_id = regex_result[2];

        let item = await ItemDocuments.findOne( { where: { id: item_id, room_id: room_id } } );

        if( item == null )
        {
            throw error_handler;
        }

        let inven_item = await InventoryDocuments.findOne( { where: { id: target_id, room_id: room_id, item_id: item_id } } );

        if ( inven_item == null )
        {
            inven_item = new InventoryDocuments({ id: target_id, room_id: room_id, item_id: item_id, item_count: 0  } );
            await inven_item.save();
        }

        let count = InventoryModel.ParseItemCount( params );
        inven_item.item_count += count;

        await inven_item.save();

        return { target_id: inven_item.id, item_id: item_id, add_count: count, result_count: inven_item.item_count };
    }

    static async GetInventoriesByRoomId( room_id : string ) : Promise<string[]>
    {
        // TODO : Inventory ID DB 따로 파는 게 나을듯
        // 그런데 sqlite 부터 글렀으니까.. 그냥... 이렇게.. 살자..
        let items = await InventoryDocuments.findAll( { where: { room_id: room_id } } )

        if( items == null ) { return []; }


        let hash : { [key : string] : boolean } = {}
        let return_array : string[] = []

        for ( let item of items )
        {
            if ( hash[item.id] === undefined )
            {
                hash[item.id] = true;
                return_array.push( item.id )
            }
        }

        return return_array;
    }
}