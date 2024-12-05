import { Box} from './box.js';

export const createEnemy=(scene, enemies)=>{
    const newEnemy = new Box({
        width: 1, 
        height: 1,
        depth: 1,
        color: 0xffff00,
        velocity: {x: 0, y: -0.01, z:0.005},
        //Math.random() generates random value 0-1
        pos: {x: Math.random() * (50 - -50) + -50, y: 3, z: -10}
    });
    newEnemy.castShadow = true;
    scene.add(newEnemy); //add to scene
    enemies.push(newEnemy); //add to enemy array
}