import Discord, {Message} from 'discord.js';
import {Parser} from "./command/parser";
const { token } = require ( "../config.json" ) ;

let client = new Discord.Client();
let parsing = new Parser();

parsing.addCallback('roll', (params : string | null)  =>
{
    let err_string = `ERROR! 사용법 : !roll <주사위 최대값> <?주사위 굴릴 횟수>`;

    if ( params == null ) { return err_string; }

    let dice_params = /(\d+)\s?(\d+)?/.exec( params );
    if ( dice_params == null )  { return err_string; }

    let dice_dimension = Number.parseInt( dice_params[1] );
    let dice_roll_number = dice_params[2] == undefined ? 1 : Number.parseInt( dice_params[2] );

    let result_string = 'Result : ';

    for( let i = 0; i < dice_roll_number; i++ )
    {
        let addition_string = i == dice_roll_number - 1 ? "" : ", ";
        let result = Math.floor( ( Math.random() * dice_dimension) ) + 1;
        result_string += result + addition_string;
    }

    return result_string;
});


client.once( 'ready', () => {
    console.log("READY.");
});

client.on( 'message', ( message : Message )  =>
{
    let result = parsing.onMessage( message.content );

    if( result != null )
    {
        message.channel.send( result );
    }
} );

client.login(token);