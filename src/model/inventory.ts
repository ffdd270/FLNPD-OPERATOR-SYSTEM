import {ItemDocuments} from "../db/documents/item";
import {InventoryDocuments} from "../db/documents/inventory";


type AddItemResult = { target_id : string, item_id : string ,add_count : number, result_count : number  };

export class InventoryModel
{
    static OptionalMakeItemCommandRegex = /^"(.+)"/;
    static GetItemRegex = /^"([^"]+)"/;
    static GetOptionalDescRegex = /"[ ]+"(.+)"/;
    static NoItemError = "그런 아이템은 없어.";

    static AddItemToInventoryRegex = /"([^"]+)"\s+"([^"]+)"/;
    static GetItemCountRegex = /"[^"]+"\s+"[^"]+"\s+(\d)/;

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

        let regex_result = InventoryModel.GetItemRegex.exec( params );
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
        let item = InventoryModel.GetItemRegex.exec( params );

        if (item == null) { throw { error_string: "이런. 여기는 원래 망가지면 안 되는 곳인데. KuroNeko한테 알려 주면 좋겠어! 추가 정보 : GetNameOrDescriptionFromParams" }; }
        obj.item_id = item[1];

        let desc = InventoryModel.GetOptionalDescRegex.exec( params );
        if ( desc == null ) { return obj; }

        obj.desc = desc[1];
        return obj;
    }


    static async AddItemDocument( params : string, room_id : string, error_handler : { error_string : string } ) : Promise<AddItemResult>
    {
        let regex_result = InventoryModel.AddItemToInventoryRegex.exec( params );
        if ( regex_result == null ) { throw error_handler; }

        let target_id = regex_result[1];
        let item_id = regex_result[2];

        let item = await ItemDocuments.findOne( { where: { id: item_id, room_id: room_id } } );

        if( item == null )
        {
            throw error_handler;
        }

        let inven_item = await  InventoryDocuments.findOne( { where: { id: target_id, item_id: item_id } } );

        if ( inven_item == null )
        {
            inven_item = new InventoryDocuments({ id: target_id, room_id: room_id, item_id: item_id, item_count: 0  } );
            await inven_item.save();
        }

        let count = 1;
        let parse_count = InventoryModel.GetItemCountRegex.exec( params );

        if ( parse_count != null )
        {
            count = Number.parseInt( parse_count[1] );
        }

        inven_item.item_count += count;

        await inven_item.save();

        return { target_id: inven_item.id, item_id: item_id, add_count: count, result_count: inven_item.item_count };
    }
}