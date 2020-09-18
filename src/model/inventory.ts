import {ItemDocuments} from "../db/documents/item";

export class InventoryModel
{
    static OptionalMakeItemCommandRegex = /^"(.+)"/;
    static GetItemRegex = /^"([^"]+)"/;
    static GetOptionalDescRegex = /"[ ]+"(.+)"/;
    static NoItemError = "그런 아이템은 없어.";

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
        if ( params == null ) { throw error_handler.error_string; }

        let regex_result = InventoryModel.GetItemRegex.exec( params );
        if ( regex_result == null ) { throw error_handler.error_string; }

        return await InventoryModel.GetTargetItemDocumentByRegex( regex_result, room_id, error_handler );
    }

    static GetNameOrDescriptionFromParams( params : string ) : { item_id : string, desc : string }
    {
        let obj = { item_id: 'temp', desc : "" };
        let item = InventoryModel.GetItemRegex.exec( params );

        if (item == null) { throw "이런. 여기는 원래 망가지면 안 되는 곳인데. KuroNeko한테 알려 주면 좋겠어! 추가 정보 : GetNameOrDescriptionFromParams"; }
        obj.item_id = item[1];

        let desc = InventoryModel.GetOptionalDescRegex.exec( params );
        if ( desc == null ) { return obj; }

        obj.desc = desc[1];
        return obj;
    }
}