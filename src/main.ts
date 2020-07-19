// 타입스크립트 트레이스 백 지원.
require('source-map-support').install();
process.on('unhandledRejection', console.log);


import Discord, {Message} from 'discord.js';
import {Parser} from "./command/parser";
import {Database} from "./db/database";
import {CharacterCommand} from "./command/character";
import {CharacterDocuments} from "./db/model/character";

const { token } = require ( "../config.json" ) ;

let client = new Discord.Client();
let parsing = new Parser();

parsing.addCallback('roll', async (params : string | null)  =>
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

CharacterCommand.addCommand( parsing );

client.once( 'ready', async () => {
    await Database.ClearDatabase();
    await Database.AddModels([CharacterDocuments]);
    console.log("READY.");
});

client.on( 'message', async ( message : Message )  =>
{
    let result = await parsing.onMessage( message.content );

    if( result != null )
    {
        await message.channel.send( result );
    }
} );

client.login(token);