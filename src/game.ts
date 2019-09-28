import utils from "../node_modules/decentraland-ecs-utils/index"
import { TriggerComponent, TriggerBoxShape } from "../node_modules/decentraland-ecs-utils/triggers/triggerSystem";

//custom components
@Component('obstacle')
export class Obstacle {
}

const birdLayer=1
const obstacleLayer=2
const beamLayer=3

//functions

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}


// Define spawner singleton object
const spawner = {
  MAX_POOL_SIZE: 20,
  pool: [] as Entity[],

  spawnEntity() {
    // Get an entity from the pool
    let ent = spawner.getEntityFromPool()

    if (!ent) return

    // Add a transform component to the entity
    /*let x =randomIntFromInterval(1,5)
    let y =randomIntFromInterval(1,10)
    let pos =randomIntFromInterval(6,10)*/
    let t = ent.getComponentOrCreate(Transform)
    t.position.set(31.5, 0, 14)
    

    //add entity to engine
    engine.addEntity(ent)
  },

  getEntityFromPool(): Entity | null {
    // Check if an existing entity can be used
    for (let i = 0; i < spawner.pool.length; i++) {
      if (!spawner.pool[i].alive) {
        return spawner.pool[i]
      }
    }
    // If none of the existing are available, create a new one, unless the maximum pool size is reached
    if (spawner.pool.length < spawner.MAX_POOL_SIZE) {
      let instance = new Entity()

      instance.addComponent(new Obstacle()) //set Obstacle flag
      instance.addComponent(new GLTFShape("models/obstacle.glb")) //set shape
      instance.addComponent(new utils.TriggerComponent(
        new utils.TriggerBoxShape(Vector3.One(), Vector3.Zero()), //shape
           obstacleLayer, //layer
           beamLayer, //triggeredByLayer
           () =>{}, //onTriggerEnter
           () =>{}, //onTriggerExit
           null, 
           null, //onCameraExit
           true
      
            ))
      spawner.pool.push(instance)
      return instance
    }
    return null
  }
}






//input handlers

const input = Input.instance

// button down event e
input.subscribe("BUTTON_DOWN", ActionButton.PRIMARY, false, e => {
  let height=bird.getComponent(Transform).position.y
  bird.getComponent(Transform).position.set(8,height+1,14)
  
})
// button down event f
input.subscribe("BUTTON_DOWN", ActionButton.SECONDARY, false, e => {
  let height=bird.getComponent(Transform).position.y
  bird.getComponent(Transform).position.set(8,height+1,14)
})

//objects in scene



let bird=new Entity()
bird.addComponent(new GLTFShape("models/bird.glb"))
bird.addComponent(new Transform({
  position: new Vector3(8.5,5.5,14)
  //rotation:
}))
bird.addComponent(new utils.TriggerComponent(
  new utils.TriggerBoxShape(Vector3.One(), Vector3.Zero()), //shape
     birdLayer, //layer
     obstacleLayer, //triggeredByLayer
     () =>{
       bird.getComponent(Transform).position=new Vector3(8.5,5.5,14)
     }, //onTriggerEnter
     null, //onTriggerExit
     null, 
     null, //onCameraExit
     true

      ))

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

let obs_16=new Entity()
obs_16.addComponent(new GLTFShape("models/obs_16.glb"))
obs_16.addComponent(new Transform({
  position:new Vector3(31.5,0,14)
}))
obs_16.addComponent(new Obstacle())

//systems

export class Gravity implements ISystem {
  update() {
    let transform = bird.getComponent(Transform)
    let current=bird.getComponent(Transform).position.y
    if(current>0){
    transform.position.y-=0.25}
    //else -> game over
  }
}

let timer: number = 0
export class createObstacles implements ISystem {
  update(dt:number) {
    if (timer>0)
      {timer-=dt}
    else
      {
        spawner.spawnEntity()
        timer=4
      }
  }
}

const obstacles = engine.getComponentGroup(Obstacle)
export class moveObstacles implements ISystem {
  //Executed ths function on every frame
  update() {
    // Iterate over the entities in an component group
    for (let entity of obstacles.entities) {
      let transform = entity.getComponent(Transform)
      let xPos=transform.position.x
      let distance = Vector3.Left().scale(0.1)
      transform.translate(distance)
      if(xPos<=1){
        engine.removeEntity(entity)}
    }
  }
}



spawner.pool.push(obs_16)

//engine 

engine.addSystem(new Gravity())
engine.addSystem(new createObstacles())
engine.addSystem(new moveObstacles())


engine.addEntity(bird)
engine.addEntity(roof)
engine.addEntity(collider)

