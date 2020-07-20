import {CharacterDocuments} from "../db/documents/character";


export class Character
{
    private name : string;
    private hp : number;

    constructor(character_model? : CharacterDocuments , hp? : number, name? : string )
    {
        if( character_model == null )
        {
            this.hp = hp || 0;
            this.name = name || "";
        }
        else
        {
            this.hp = character_model.hp;
            this.name = character_model.name;
        }
    }

    isDead()
    {
        return this.hp <= 0;
    }

    getName() { return this.name; }
    getHp() { return this.hp; }

    // 공격 가능 여부를 던져줌.
    procDamage( dmg : number ) : boolean
    {
        if ( this.isDead() ) { return false; }
        this.hp -= dmg;

        return true;
    }


}