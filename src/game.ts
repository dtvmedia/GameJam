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
const checkpointLayer=4
const obstacles = engine.getComponentGroup(Obstacle)
let timer:number=0.5
let obstacletimer: number = 0
const entryPos= new Vector3(7.5,8,12.5)
let clicked:boolean=false
let globalTimer:number=0


//functions

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function gravity(value) { // min and max included 
  return -0.4*Math.log(-value+2)+0.15;
}

function hit(){
   //onTriggerEnter
    clicked=false
    engine.removeSystem(GravitySystem)
    engine.removeSystem(createObstaclesSystem)
    engine.removeSystem(moveObstaclesSystem) 
    spawner.pool.forEach(entity=>{
      if(entity.isAddedToEngine)engine.removeEntity(entity)
    })
    checkpoint.pool.forEach(entity=>{
      if(entity.isAddedToEngine)engine.removeEntity(entity)
    })
    bird.getComponent(Transform).position=entryPos
    let lerp=bird.getComponent(LerpData)
    let slerp=bird.getComponent(SlerpData)
    timer=0.5
    lerp.fraction=0
    slerp.fraction=0
 }



let checkpoint = {
  MAX_POOL_SIZE: 20,
  pool: [] as Entity[],

  spawnEntity() {
    // Get an entity from the pool
    let ent = checkpoint.getEntityFromPool()

    if (!ent) return

    let t = ent.getComponentOrCreate(Transform)
    t.position.set(30.5, 1, 12.5)
    

    //add entity to engine
    engine.addEntity(ent)
  },

  getEntityFromPool(): Entity | null {
    // Check if an existing entity can be used
      
    
    for (let i = 0; i < checkpoint.pool.length; i++) {
      if (!checkpoint.pool[i].alive) {
        log(checkpoint.pool[i])
        return checkpoint.pool[i]
      }
    }
    // If none of the existing are available, create a new one, unless the maximum pool size is reached
    if (checkpoint.pool.length < checkpoint.MAX_POOL_SIZE) {
      let instance = new Entity()
      instance.addComponent(new Obstacle()) //set Obstacle flag
      instance.addComponent(new utils.TriggerComponent(
        new utils.TriggerBoxShape(new Vector3(1,14,1), new Vector3(0,7,0)), //shape
        checkpointLayer, //layer
        birdLayer, //triggeredByLayer
        null, //onTriggerEnter
        ()=>{log("exited checkpoint")}, //onTriggerExit
        null, 
        null, //onCameraExit
        true
   
         ))
      checkpoint.pool.push(instance)
      
      return instance
    }
    return null
  }
}











// Define spawner singleton object
let spawner = {
  MAX_POOL_SIZE: 20,
  pool: [] as Entity[],

  spawnEntity() {
    // Get an entity from the pool
    let ent = spawner.getEntityFromPool()

    if (!ent) return

    let t = ent.getComponentOrCreate(Transform)
    t.position.set(30.5, 1, 12.5)
    

    //add entity to engine
    engine.addEntity(ent)
  },

  getEntityFromPool(): Entity | null {
    // Check if an existing entity can be used
    let random=randomIntFromInterval(1,11)-1
    while(spawner.pool[random].alive){
      random=randomIntFromInterval(1,11)-1
    }
    return spawner.pool[random]
    
    
    /*for (let i = 0; i < spawner.pool.length; i++) {
      if (!spawner.pool[i].alive) {
        log(spawner.pool[i])
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
    return null*/
  }
}


//input handlers

const input = Input.instance

// button down event e
input.subscribe("BUTTON_DOWN", ActionButton.PRIMARY, false, e => {
  if(clicked)timer=-0.1
})
// button down event f
input.subscribe("BUTTON_DOWN", ActionButton.SECONDARY, false, e => {
  if(clicked)timer=-0.5
})
// mmousclick on bird
input.subscribe("BUTTON_UP", ActionButton.POINTER, true, e => {
  if(e.hit.entityId=='Eb'){
    clicked=true
    engine.addSystem(GravitySystem)
    engine.addSystem(createObstaclesSystem)
    engine.addSystem(moveObstaclesSystem) 
  }
})

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
     null, //triggeredByLayer
     null, 
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
     null, //onTriggerEnter
     null, //onTriggerExit
     null, 
     null, //onCameraExit
     false

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
     false

      ))

let wall=new Entity()
wall.addComponent(new Transform({
  position: new Vector3(16,0.5,8)
}))
wall.addComponent(new GLTFShape("models/wall.glb"))
wall.getComponent(Transform).rotate(Vector3.Up(),180)

let inv_wall=new Entity()
inv_wall.addComponent(new Transform({
  position: new Vector3(16,0.5,8)
}))
inv_wall.addComponent(new GLTFShape("models/inv_wall.glb"))

let obs1=new Entity()
obs1.addComponent(new Transform())
obs1.addComponent(new GLTFShape("models/obs1.glb"))
obs1.addComponent(new Obstacle())
obs1.addComponent(new utils.TriggerComponent(
  new utils.TriggerBoxShape(new Vector3(1,10,1), new Vector3(0,5,0)), //shape
     obstacleLayer, //layer
     birdLayer, //triggeredByLayer 
     ()=>hit(), //onTriggerEnter
     null, //onTriggerExit
     null, 
     null, //onCameraExit
     false

      ))
spawner.pool.push(obs1)

let obs2=new Entity()
let obs2_triggeroben=new(Entity)
obs2_triggeroben.setParent(obs2)
obs2_triggeroben.addComponent(new utils.TriggerComponent(
  new utils.TriggerBoxShape(new Vector3(1,1,1), new Vector3(0,13.5,0)), //shape
     obstacleLayer, //layer
     birdLayer, //triggeredByLayer 
     ()=>hit(), //onTriggerEnter
     null, //onTriggerExit
     null,  
     null, //onCameraExit
     false

      ))
obs2.addComponent(new Transform())  
obs2.addComponent(new GLTFShape("models/obs2.glb"))
obs2.addComponent(new Obstacle())
obs2.addComponent(new utils.TriggerComponent(
  new utils.TriggerBoxShape(new Vector3(1,9,1), new Vector3(0,4.5,0)), //shape
     obstacleLayer, //layer
     birdLayer, //triggeredByLayer 
     ()=>hit(), //onTriggerEnter
     null, //onTriggerExit
     null, 
     null, //onCameraExit
     false

      ))
spawner.pool.push(obs2)

let obs3=new Entity()
let obs3_triggeroben=new(Entity)
obs3_triggeroben.setParent(obs3)
obs3_triggeroben.addComponent(new utils.TriggerComponent(
  new utils.TriggerBoxShape(new Vector3(1,2,1), new Vector3(0,13,0)), //shape
     obstacleLayer, //layer
     birdLayer, //triggeredByLayer 
     ()=>hit(), //onTriggerEnter
     null, //onTriggerExit
     null,  
     null, //onCameraExit
     false

      ))
obs3.addComponent(new Transform())  
obs3.addComponent(new GLTFShape("models/obs3.glb"))
obs3.addComponent(new Obstacle())
obs3.addComponent(new utils.TriggerComponent(
  new utils.TriggerBoxShape(new Vector3(1,8,1), new Vector3(0,4,0)), //shape
     obstacleLayer, //layer
     birdLayer, //triggeredByLayer 
     ()=>hit(), //onTriggerEnter
     null, //onTriggerExit
     null, 
     null, //onCameraExit
     false

      ))
spawner.pool.push(obs3)

let obs4=new Entity()
let obs4_triggeroben=new(Entity)
obs4_triggeroben.setParent(obs4)
obs4_triggeroben.addComponent(new utils.TriggerComponent(
  new utils.TriggerBoxShape(new Vector3(1,3,1), new Vector3(0,12.5,0)), //shape
     obstacleLayer, //layer
     birdLayer, //triggeredByLayer 
     ()=>hit(), //onTriggerEnter
     null, //onTriggerExit
     null,  
     null, //onCameraExit
     false

      ))
obs4.addComponent(new Transform())  
obs4.addComponent(new GLTFShape("models/obs4.glb"))
obs4.addComponent(new Obstacle())
obs4.addComponent(new utils.TriggerComponent(
  new utils.TriggerBoxShape(new Vector3(1,7,1), new Vector3(0,3.5,0)), //shape
     obstacleLayer, //layer
     birdLayer, //triggeredByLayer 
     ()=>hit(), //onTriggerEnter
     null, //onTriggerExit
     null, 
     null, //onCameraExit
     false

      ))
spawner.pool.push(obs4)

let obs5=new Entity()
let obs5_triggeroben=new(Entity)
obs5_triggeroben.setParent(obs5)
obs5_triggeroben.addComponent(new utils.TriggerComponent(
  new utils.TriggerBoxShape(new Vector3(1,4,1), new Vector3(0,12,0)), //shape
     obstacleLayer, //layer
     birdLayer, //triggeredByLayer 
     ()=>hit(), //onTriggerEnter
     null, //onTriggerExit
     null,  
     null, //onCameraExit
     false

      ))
obs5.addComponent(new Transform())  
obs5.addComponent(new GLTFShape("models/obs5.glb"))
obs5.addComponent(new Obstacle())
obs5.addComponent(new utils.TriggerComponent(
  new utils.TriggerBoxShape(new Vector3(1,6,1), new Vector3(0,3,0)), //shape
     obstacleLayer, //layer
     birdLayer, //triggeredByLayer 
     ()=>hit(), //onTriggerEnter
     null, //onTriggerExit
     null, 
     null, //onCameraExit
     false

      ))
spawner.pool.push(obs5)

let obs6=new Entity()
let obs6_triggeroben=new(Entity)
obs6_triggeroben.setParent(obs6)
obs6_triggeroben.addComponent(new utils.TriggerComponent(
  new utils.TriggerBoxShape(new Vector3(1,5,1), new Vector3(0,11.5,0)), //shape
     obstacleLayer, //layer
     birdLayer, //triggeredByLayer 
     ()=>hit(), //onTriggerEnter
     null, //onTriggerExit
     null,  
     null, //onCameraExit
     false

      ))
obs6.addComponent(new Transform())  
obs6.addComponent(new GLTFShape("models/obs6.glb"))
obs6.addComponent(new Obstacle())
obs6.addComponent(new utils.TriggerComponent(
  new utils.TriggerBoxShape(new Vector3(1,5,1), new Vector3(0,2.5,0)), //shape
     obstacleLayer, //layer
     birdLayer, //triggeredByLayer 
     ()=>hit(), //onTriggerEnter
     null, //onTriggerExit
     null, 
     null, //onCameraExit
     false

      ))
spawner.pool.push(obs6)

let obs7=new Entity()
let obs7_triggeroben=new(Entity)
obs7_triggeroben.setParent(obs7)
obs7_triggeroben.addComponent(new utils.TriggerComponent(
  new utils.TriggerBoxShape(new Vector3(1,6,1), new Vector3(0,11,0)), //shape
     obstacleLayer, //layer
     birdLayer, //triggeredByLayer 
     ()=>hit(), //onTriggerEnter
     null, //onTriggerExit
     null,  
     null, //onCameraExit
     false

      ))
obs7.addComponent(new Transform())  
obs7.addComponent(new GLTFShape("models/obs7.glb"))
obs7.addComponent(new Obstacle())
obs7.addComponent(new utils.TriggerComponent(
  new utils.TriggerBoxShape(new Vector3(1,4,1), new Vector3(0,2,0)), //shape
     obstacleLayer, //layer
     birdLayer, //triggeredByLayer 
     ()=>hit(), //onTriggerEnter
     null, //onTriggerExit
     null, 
     null, //onCameraExit
     false

      ))
spawner.pool.push(obs7)

let obs8=new Entity()
let obs8_triggeroben=new(Entity)
obs8_triggeroben.setParent(obs8)
obs8_triggeroben.addComponent(new utils.TriggerComponent(
  new utils.TriggerBoxShape(new Vector3(1,7,1), new Vector3(0,10.5,0)), //shape
     obstacleLayer, //layer
     birdLayer, //triggeredByLayer 
     ()=>hit(), //onTriggerEnter
     null, //onTriggerExit
     null,  
     null, //onCameraExit
     false

      ))
obs8.addComponent(new Transform())  
obs8.addComponent(new GLTFShape("models/obs8.glb"))
obs8.addComponent(new Obstacle())
obs8.addComponent(new utils.TriggerComponent(
  new utils.TriggerBoxShape(new Vector3(1,3,1), new Vector3(0,1.5,0)), //shape
     obstacleLayer, //layer
     birdLayer, //triggeredByLayer 
     ()=>hit(), //onTriggerEnter
     null, //onTriggerExit
     null, 
     null, //onCameraExit
     false

      ))
spawner.pool.push(obs8)

let obs9=new Entity()
let obs9_triggeroben=new(Entity)
obs9_triggeroben.setParent(obs9)
obs9_triggeroben.addComponent(new utils.TriggerComponent(
  new utils.TriggerBoxShape(new Vector3(1,8,1), new Vector3(0,10,0)), //shape
     obstacleLayer, //layer
     birdLayer, //triggeredByLayer 
     ()=>hit(), //onTriggerEnter
     null, //onTriggerExit
     null,  
     null, //onCameraExit
     false

      ))
obs9.addComponent(new Transform())  
obs9.addComponent(new GLTFShape("models/obs9.glb"))
obs9.addComponent(new Obstacle())
obs9.addComponent(new utils.TriggerComponent(
  new utils.TriggerBoxShape(new Vector3(1,2,1), new Vector3(0,1,0)), //shape
     obstacleLayer, //layer
     birdLayer, //triggeredByLayer 
     ()=>hit(), //onTriggerEnter
     null, //onTriggerExit
     null, 
     null, //onCameraExit
     false

      ))
spawner.pool.push(obs9)

let obs10=new Entity()
let obs10_triggeroben=new(Entity)
obs10_triggeroben.setParent(obs10)
obs10_triggeroben.addComponent(new utils.TriggerComponent(
  new utils.TriggerBoxShape(new Vector3(1,9,1), new Vector3(0,9.5,0)), //shape
     obstacleLayer, //layer
     birdLayer, //triggeredByLayer 
     ()=>hit(), //onTriggerEnter
     null, //onTriggerExit
     null,  
     null, //onCameraExit
     false

      ))
obs10.addComponent(new Transform())  
obs10.addComponent(new GLTFShape("models/obs10.glb"))
obs10.addComponent(new Obstacle())
obs10.addComponent(new utils.TriggerComponent(
  new utils.TriggerBoxShape(new Vector3(1,1,1), new Vector3(0,0.5,0)), //shape
     obstacleLayer, //layer
     birdLayer, //triggeredByLayer 
     ()=>hit(), //onTriggerEnter
     null, //onTriggerExit
     null, 
     null, //onCameraExit
     false

      ))
spawner.pool.push(obs10)

let obs11=new Entity()
obs11.addComponent(new Transform())
obs11.addComponent(new GLTFShape("models/obs11.glb"))
obs11.addComponent(new Obstacle())
obs11.addComponent(new utils.TriggerComponent(
  new utils.TriggerBoxShape(new Vector3(1,10,1), new Vector3(0,9,0)), //shape
     obstacleLayer, //layer
     birdLayer, //triggeredByLayer 
     ()=>hit(), //onTriggerEnter
     null, //onTriggerExit
     null, 
     null, //onCameraExit
     false

      ))
spawner.pool.push(obs11)


//systems

export class createObstacles implements ISystem {
  update(dt:number) {
    globalTimer+=dt
    if (obstacletimer>0)
      {obstacletimer-=dt}
    else
      {
        spawner.spawnEntity()
        checkpoint.spawnEntity()
        //checkpoint.spawnEntity()
        if(globalTimer>10){
          globalTimer=0
          if(obstacletimer>=2.2) obstacletimer-=0.2}
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
engine.addEntity(inv_wall)

let createObstaclesSystem=new createObstacles()
let moveObstaclesSystem=new moveObstacles()
let GravitySystem=new Gravity()



