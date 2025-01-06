export const animatePlane = (geometry, count, waterTexture) => {
    //iterate through verties of water plane
    for (let i = 0; i < count; i++){
        const x = geometry.attributes.position.getX(i); //get x position of vertex
        const y = geometry.attributes.position.getY(i); //get x position of vertex

        const xsin = Math.sin (x + frames/120); //find sin value of vertice's x pos and frames/60
        const ycos = Math.cos(y + frames/120);
        
        geometry.attributes.position.setZ(i, xsin + ycos); //set z pos of vertex
    }
    geometry.computeVertexNormals(); //recalculate vertex normals so shadows look correct
    geometry.attributes.position.needsUpdate = true; //update position of vertices
    waterTexture.offset.y += 0.0005; //offset texture to give appearance of moving water
}