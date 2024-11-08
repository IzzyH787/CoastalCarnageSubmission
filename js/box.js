import * as THREE from 'three'; //import three.js

//create new box class that inherits all properties from THREE.Mesh


export class Box extends THREE.Mesh{
    constructor({width, height, depth, color = '#00ff00', velocity = {x: 0, y: 0, z: 0}, pos = {x: 0, y: 0, z: 0}})
    {
        //calls THREE.Mesh constructor, creating default green box
        super(
            new THREE.BoxGeometry(width, height, depth), 
            new THREE.MeshStandardMaterial({color:color})
        ); 

        this.width = width;
        this.height = height; //define height of box
        this.depth = depth;

        this.position.set(pos.x, pos.y, pos.z);

        this.bottomPosition = this.position.y - this.height / 2;
        this.topPosition = this.position.y + this.height / 2;
        this.leftPosition = this.position.x - this.width / 2;
        this.rightPosition = this.position.x + this.width / 2;
        this.frontPosition = this.position.z + this.depth / 2;
        this.backPosition = this.position.z - this.depth / 2;

        this.velocity = velocity;
        this.gravity = -0.002;
        
    }

    updateSides(){
        //set edge positions so can check for collisions
        this.bottomPosition = this.position.y - this.height / 2;
        this.topPosition = this.position.y + this.height / 2;
        this.leftPosition = this.position.x - this.width / 2;
        this.rightPosition = this.position.x + this.width / 2;
        this.frontPosition = this.position.z + this.depth / 2;
        this.backPosition = this.position.z - this.depth / 2;
    }

    update(ground)
    {
        this.updateSides();
        

        //apply movement
        this.position.x += this.velocity.x;
        this.position.z += this.velocity.z;

        this.applyGravity(ground);
        
        
    }
    applyGravity(ground){
        this.velocity.y += this.gravity; //add gravity

        //check for collsion with floor (1 frame ahead)
        if (boxCollision({box1: this, box2: ground})){
            //hitting floor
            this.velocity.y *= 0.5; //reduce velocity to create friciton between bounces, reduce bounce height
            this.velocity.y = -this.velocity.y; //reverse velocity for bounce effect
        }
        else{
            //if not hitting floor
            this.position.y += this.velocity.y
        }
    }
}

export const boxCollision=({box1, box2})=>{
    const xCollision = ( (box1.rightPosition >= box2.leftPosition) && (box1.leftPosition <= box2.rightPosition) );
    //frame ahead for y collision, gravity
    const yCollision = ( (box1.bottomPosition + box1.velocity.y <= box2.topPosition) && (box1.topPosition >= box2.bottomPosition) );
    const zCollision = ( (box1.frontPosition >= box2.backPosition) && (box1.backPosition <= box2.frontPosition) );
    
    return (xCollision && yCollision && zCollision)
}