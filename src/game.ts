import utils from "../node_modules/decentraland-ecs-utils/index"

//custom components
@Component('obstacle')
export class Obstacle {
}

@Component("lerpData")
export class LerpData {
  origin: Vector3 = Vector3.Zero()
  target: Vector3 = Vector3.Zero()
  fraction: number = 0
}

@Component("slerpData")
export class SlerpData {
  origin: Quaternion
  target: Quaternion
  fraction: number = 0
}


//Variables

const birdLayer=1
const obstacleLayer=2
const obstacles = engine.getComponentGroup(Obstacle)
let timer:number=0.5
let obstacletimer: number = 0
const entryPos= new Vector3(7.5,8,12.5)


//functions

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function gravity(value) { // min and max included 
  return -0.4*Math.log(-value+2)+0.15;
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
    t.position.set(30.5, 0, 12.5)
    

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
           null, //triggeredByLayer
           null, //onTriggerEnter
           null, //onTriggerExit
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
    timer=-0.3 
})
// button down event f
input.subscribe("BUTTON_DOWN", ActionButton.SECONDARY, false, e => {
})
// mmousclick on bird
input.subscribe("BUTTON_UP", ActionButton.POINTER, true, e => {
  if(e.hit.entityId=='Eb'){
    engine.addSystem(GravitySystem)
    engine.addSystem(createObstaclesSystem)
    engine.addSystem(moveObstaclesSystem) 
  }
})

//objects in scene

let bird=new Entity()
bird.addComponent(new Transform({
  position:entryPos
}))
bird.addComponent(new GLTFShape("models/bird.glb"))
bird.addComponent(new SlerpData())
bird.addComponent(new LerpData())
bird.addComponent(new utils.TriggerComponent(
  new utils.TriggerSphereShape(1, new Vector3(0,0,0)), //shape
     birdLayer, //layer
     obstacleLayer, //triggeredByLayer
     ()=>{  //onTriggerEnter
        engine.removeSystem(GravitySystem)
        engine.removeSystem(createObstaclesSystem)
        engine.removeSystem(moveObstaclesSystem) 
        spawner.pool.forEach(entity=>{
          engine.removeEntity(entity)
        })
        bird.getComponent(Transform).position=entryPos
        let lerp=bird.getComponent(LerpData)
        let slerp=bird.getComponent(SlerpData)
        timer=0.5
        lerp.fraction=0
        slerp.fraction=0
     }, 
     null, //onTriggerExit
     null, 
     null, //onCameraExit
     true

      ))

      
let roof=new Entity()
roof.addComponent(new Transform({
  position: new Vector3(16,15.5,8)
}))
roof.addComponent(new GLTFShape("models/roof.glb"))
roof.addComponent(new utils.TriggerComponent(
  new utils.TriggerBoxShape(new Vector3(32,1,16), Vector3.Zero()), //shape
     obstacleLayer, //layer
     null, //triggeredByLayer
     () =>{}, //onTriggerEnter
     () =>{}, //onTriggerExit
     null, 
     null, //onCameraExit
     true

      ))

let floor=new Entity()
floor.addComponent(new Transform({
  position: new Vector3(16,0.5,8)
}))
floor.addComponent(new GLTFShape("models/floor.glb"))
floor.getComponent(Transform).rotate(Vector3.Up(),180)
floor.addComponent(new utils.TriggerComponent(
  new utils.TriggerBoxShape(new Vector3(32,1,16), Vector3.Zero()), //shape
     obstacleLayer, //layer
     null, //triggeredByLayer
     () =>{}, //onTriggerEnter
     () =>{}, //onTriggerExit
     null, 
     null, //onCameraExit
     true

      ))

let wall=new Entity()
wall.addComponent(new Transform({
  position: new Vector3(16,0.5,8)
}))
wall.addComponent(new GLTFShape("models/wall.glb"))
wall.getComponent(Transform).rotate(Vector3.Up(),180)

//systems

export class createObstacles implements ISystem {
  update(dt:number) {
    if (obstacletimer>0)
      {obstacletimer-=dt}
    else
      {
        spawner.spawnEntity()
        obstacletimer=4
      }
  }
}

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

export class Gravity implements ISystem {
  update(dt: number) {
    let transform = bird.getComponent(Transform)
    let lerp = bird.getComponent(LerpData)
    let slerp = bird.getComponent(SlerpData)
    let rotz= bird.getComponent(Transform).rotation.eulerAngles.z

    lerp.origin=transform.position
    lerp.target=new Vector3(transform.position.x,transform.position.y-1,transform.position.z)
    slerp.origin=transform.rotation
    slerp.target=Quaternion.Euler(0,0,rotz-30)
    
    timer+=dt
    if(gravity(timer)>1){
      lerp.fraction=1
      slerp.fraction=0.7
    }else{
    lerp.fraction=gravity(timer)
    slerp.fraction=gravity(timer)
    }
      transform.position = Vector3.Lerp(
      lerp.origin,
      lerp.target,
      lerp.fraction
      )
      transform.rotation=Quaternion.Slerp(
      slerp.origin,
      slerp.target,
      slerp.fraction  
      )
    
  }
}




//engine 
engine.addEntity(bird)
engine.addEntity(roof)
engine.addEntity(floor)
engine.addEntity(wall)

let createObstaclesSystem=new createObstacles()
let moveObstaclesSystem=new moveObstacles()
let GravitySystem=new Gravity()



