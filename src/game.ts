import utils from "../node_modules/decentraland-ecs-utils/index"

let floor=new Entity()
floor.addComponent(new GLTFShape("models/floor.glb"))
floor.addComponent(new Transform({
  position: new Vector3(8,0,24)
  //rotation:
}))
let ball=new Entity()
ball.addComponent(new GLTFShape("models/ball.glb"))
ball.addComponent(new Transform({
  position: new Vector3(8,0.75,24)
  //rotation:
}))

engine.addEntity(ball)
engine.addEntity(floor)