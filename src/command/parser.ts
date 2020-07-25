import {Message} from 'discord.js';

export type CommandCallback = (params : string | null, message : Message) => Promise<string>;

export class Parser
{
    private parser_map : Map<string, CommandCallback> = new Map<string, CommandCallback>();
    private command_check_regex : RegExp = /^!([\w]+)\s?(.+)?/;

    constructor()
    {

    }

    addCallback( key : string, callback : CommandCallback  )
    {
        this.parser_map.set( key, callback );
    }


    async onMessage( message : Message ) : Promise<string | null>
    {
        let command_parse = this.command_check_regex.exec( message.content );
        if ( command_parse == null ) { return null; }

        let command = command_parse[1];
        let params = command_parse.length > 2 ? command_parse[2] : null;

        let callback = this.parser_map.get(command);
        if( callback == null ) { return null; }

        try
        {
            let result = await callback( params, message );
            if( result == "" )
            {
                return null;
            }

            return result;
        }
        catch( error_obj )
        {
            if ( error_obj.error_string != undefined )
            {
                return error_obj.error_string;
            }
            else
            {
                return error_obj.Message;
            }
        }
    }
}