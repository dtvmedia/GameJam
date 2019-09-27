import utils from "../node_modules/decentraland-ecs-utils/index"

//functions

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

//input handlers

const input = Input.instance

// button down event e
input.subscribe("BUTTON_DOWN", ActionButton.PRIMARY, false, e => {
  let height=cube.getComponent(Transform).position.y
  cube.getComponent(Transform).position.set(8,height+1,14)
  
})
// button down event f
input.subscribe("BUTTON_DOWN", ActionButton.SECONDARY, false, e => {
  let height=cube.getComponent(Transform).position.y
  cube.getComponent(Transform).position.set(8,height+1,14)
})

//objects in scene

let cube=new Entity()
cube.addComponent(new GLTFShape("models/cube.glb"))
cube.addComponent(new Transform({
  position: new Vector3(8,5,14)
  //rotation:
}))

let roof=new Entity()
roof.addComponent(new GLTFShape("models/roof.glb"))
roof.addComponent(new Transform({
  position: new Vector3(16,0,8)
  //rotation:
}))

let collider=new Entity()
collider.addComponent(new GLTFShape("models/collider.glb"))
collider.addComponent(new Transform({
  position: new Vector3(16,0,8)
  //rotation:
}))

let obstacle = new Entity()
obstacle.addComponent(new GLTFShape("models/obstacle.glb"))
obstacle.addComponent(new Transform({
  scale: new Vector3(1,10,1),
  position: new Vector3(31,-3,14)
}))

let obstacle2 = new Entity()
obstacle2.addComponent(new GLTFShape("models/obstacle.glb"))
obstacle2.addComponent(new Transform({
  scale: new Vector3(1,10,1),
  position: new Vector3(31,-3,14)
}))




//systems


export class MoveObstacle implements ISystem {
  entity: Entity
  constructor(_entity){
    this.entity=_entity
  }
  update() {
    if(this.entity.isAddedToEngine){
      engine.addEntity(this.entity)}
    let transform = this.entity.getComponent(Transform)
    let xPos=transform.position.x
    let distance = Vector3.Left().scale(0.1)
    transform.translate(distance)
    if(xPos<=1){
      engine.removeEntity(this.entity)
      
    }
  }
}





export class MoveBird implements ISystem {
  update() {
    let transform = cube.getComponent(Transform)
    let current=cube.getComponent(Transform).position.y
    if(current>0){
    transform.position.y-=0.2}
    //else -> game over
  }
}

export class newSpawn implements ISystem {
  onRemoveEntity(entity: Entity){}
    // Code to run once

    
    
  }



//engine 


engine.addSystem(new MoveBird())
engine.addSystem(new MoveObstacle(obstacle))



engine.addEntity(cube)
engine.addEntity(roof)
engine.addEntity(collider)

