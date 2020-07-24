import {Parser} from "./parser";
const { help, help_all } = require ( "../../help.json" ) ;


class HelpCommand
{
    public command! : string;
    public data! : string;
    public usage! : string;

}

export class HelpCommands
{
    static NormalCommands : HelpCommand[] = help;
    static OperatorCommands : HelpCommand[] = help_all;


    constructor()
    {

    }


    static EachData( commands : HelpCommand[] )
    {
        let result_string = "";
        for ( let obj of commands )
        {
            result_string += "!" + obj.command + "\n";
            result_string +=  "```" + obj.data + "\n\n";
            result_string += "사용법은, !" + obj.usage + "```\n";
        }

        return result_string;
    }

    static async SimpleCommand()
    {
        let result_string = "";

        result_string += "반가워. 이건 FLNPD Operator System의 설명서야. 혹시 궁금한 게 있으면, @KuroNeko를 태그해줘!\n\n" ;
        result_string += HelpCommands.EachData( HelpCommands.NormalCommands );

        return result_string;
    }

    static async ShowCommand()
    {
        let result_string = "";
        result_string += "반가워. 이건 FLNPD Operator System의 설명서야. 혹시 궁금한 게 있으면, @KuroNeko를 태그해줘!\n\n" ;
        result_string += HelpCommands.EachData( HelpCommands.OperatorCommands );

        return result_string;
    }

    static addCommand( parser : Parser )
    {
        parser.addCallback( "help", this.SimpleCommand );
        parser.addCallback("help_all", this.ShowCommand );
    }
}