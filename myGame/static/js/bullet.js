//imports
import * as THREE from 'three'; //import three.js
import { Box } from './box.js';

//////////////////DEFINING VARIABLES//////////////  
export let bullets = []; //create array to store trees


//////////////////DEFINING CLASS//////////////  
export class Bullet extends Box{
    constructor(player){
        //direction vector of player = ( (sin(angle), 0, cons(angle) )
        const directionVector = new THREE.Vector3( Math.sin(player.characterModel.rotation.y), 0, Math.cos(player.characterModel.rotation.y) );
        const speed = 0.06;
        const bulletVelocity = directionVector * speed;
        console.log(bulletVelocity);
        //sets all properties
        super({width: 1, height: 1, depth: 1, color: '#ff0000', velocity: bulletVelocity, pos: {x: player.position.x, y: player.position.y, z: player.position.z}})
    }

    Update=()=>{
        this.position.x += this.velocity.x;
        this.position.z += this.velocity.z;
        //this.position.set(this.position.x + this.velocity.x, this.position.y + this.velocity.y, this.position.z + this.velocity.z);
    }
}