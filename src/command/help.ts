import {Parser} from "./parser";
const { help, help_all } = require ( "../../help.json" ) ;


class HelpCommand
{
    public command! : string;
    public simple_command? :string;
    public data! : string;
    public usage! : string;

}

export class HelpCommands
{
    static NormalCommands : HelpCommand[] = help;
    static OperatorCommands : HelpCommand[][] = help_all;


    constructor()
    {

    }


    static EachData( commands : HelpCommand[] )
    {
        let result_string = "";
        for ( let obj of commands )
        {
            result_string += "!" + obj.command + "\n";
            if( obj.simple_command != undefined )
            {
                result_string += "단축 명령어 : !" + obj.simple_command + "\n";
            }
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


    static HelpRegex = /(\d)/;

    static async ShowCommand( params : string | null)
    {
        let result_string = "";
        let page = 1;

        if (params != null)
        {
            let regex_result = HelpCommands.HelpRegex.exec( params );
            if ( regex_result == null )
            {
                page = 1;
            }
            else
            {
                page = Number.parseInt( regex_result[1] );
            }
        }
        else
        {
            page = 1;
        }

        if ( page < 0 || page > HelpCommands.OperatorCommands.length )
        {
            result_string = `이런. 페이지를 잘못 넣은 것 같은데. 0이상, ${HelpCommands.OperatorCommands.length}이하의 값을 넣어줘.`;
            return result_string;
        }

        result_string += "반가워. 이건 FLNPD Operator System의 설명서야. 혹시 궁금한 게 있으면, @KuroNeko를 태그해줘!\n\n" ;
        result_string += `이 페이지는 ${page}/${HelpCommands.OperatorCommands.length}야. 2 페이지를 보고 싶으면, !help-all 2 처럼 넣어줘.\n`;
        result_string += HelpCommands.EachData( HelpCommands.OperatorCommands[page - 1] );

        return result_string;
    }

    static addCommand( parser : Parser )
    {
        parser.addCallback( "help", this.SimpleCommand );
        parser.addCallback("help_all", this.ShowCommand );
    }
}