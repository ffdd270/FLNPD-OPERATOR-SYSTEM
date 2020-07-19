export type CommandCallback = (params : string | null, command :string, message : string) => Promise<string>;

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


    async onMessage( message : string ) : Promise<string | null>
    {
        let command_parse = this.command_check_regex.exec( message );
        if ( command_parse == null ) { return null; }

        let command = command_parse[1];
        let params = command_parse.length > 2 ? command_parse[2] : null;

        let callback = this.parser_map.get(command);
        if( callback == null ) { return null; }

        let result = await callback( params, command, message );
        if( result == "" )
        {
            return null;
        }

        return result;
    }
}