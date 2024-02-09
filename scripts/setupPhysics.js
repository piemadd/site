import Matter from "matter-js";

// module aliases
const Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite;

let engine;

// for element IDs
let physIDToDOMID = {};

const mainElement = document.getElementById('mainSection');
const physiscsElement = document.getElementById('physicsArea');

const getElementPos = (element) => {
  return element.getBoundingClientRect().top + mainElement.scrollTop + 64;
}

const getCoords = (element) => { // crossbrowser version
  var box = element.getBoundingClientRect();

  var mainEl = mainElement;

  var scrollTop = mainEl.scrollTop || mainEl.scrollTop;
  var scrollLeft = mainEl.scrollLeft || mainEl.scrollLeft;

  var clientTop = mainEl.clientTop || 0;
  var clientLeft = mainEl.clientLeft || 0;

  var top = box.top + scrollTop - clientTop;
  var left = box.left + scrollLeft - clientLeft;

  return { top: Math.round(top), left: Math.round(left), width: box.width, height: box.height };
}

const getElementsToRun = () => {
  return Array.from(document.getElementsByClassName('phys')).map((elem) => {
    //elem.style['color'] = '#ffffff';
    //elem.style['background-color'] = '#ff0000';
    //elem.style['position'] = 'relative';
    //elem.style['border'] = '1px solid #0000ff';
    elem.style['border'] = '1px solid #ffffff';

    elem.elemMeta = getCoords(elem);

    return elem;
  });
};

const radiansToDegrees = (radians) => radians * (180 / Math.PI);

const updateElementPositions = (engine, final = false) => {
  Composite.allBodies(engine.world).forEach((body) => {
    if (physIDToDOMID[body.id]) {
      const targetElement = document.getElementById(physIDToDOMID[body.id]);

      targetElement.style['transform'] = `translate(${body.position.x - body.orig.x}px, ${body.position.y - body.orig.y}px) rotate(${radiansToDegrees(body.angle)}deg)`;
      //targetElement.style['top'] = 

      if (final) {
        console.log(targetElement.style)
        console.log(body)
      }
    }
  })
};

export const setupPhysics = () => {
  const elements = getElementsToRun();
  const mainSize = [mainElement.scrollWidth, mainElement.scrollHeight];

  // create an engine
  engine = Engine.create();

  const processedElements = elements.map((element, i) => {
    const body = Bodies.rectangle(element.elemMeta.left + (element.elemMeta.width / 2), element.elemMeta.top + (element.elemMeta.height / 2), element.elemMeta.width, element.elemMeta.height, {
      orig: {
        x: element.elemMeta.left + (element.elemMeta.width / 2),
        y: element.elemMeta.top + (element.elemMeta.height / 2),
      }
    });

    //giving elements without IDs an ID
    if (element.id.length === 0) {
      element.id = `phys-elem-${i}`;
    }

    //saving ID so the element can be updated
    physIDToDOMID[body.id] = element.id;

    //console.log(element)
    //console.log(body)

    return body;
  });

  console.log(mainSize)
  const ground = Bodies.rectangle(mainSize[0] / 2, mainSize[1] + 100, 1000, 100, { isStatic: true });
  const leftWall = Bodies.rectangle(-50, mainSize[1] / 2, 100, mainSize[1], { isStatic: true });
  const rightWall = Bodies.rectangle(mainSize[0] + 50, mainSize[1] / 2, 100, mainSize[1], { isStatic: true });

  console.log(processedElements)

  // add all of the bodies to the world
  Composite.add(engine.world, [ground, leftWall, rightWall]);
  Composite.add(engine.world, processedElements);

  console.log(engine)

  mainElement.style.overflow = 'none';

  // create runner
  //var runner = Runner.create();

  // run the engine
  //Runner.run(runner, engine);
};

export const updatePhysics = (print = false) => {
  Engine.update(engine);
  updateElementPositions(engine, print);
}

export const runPhysics = () => {
  //requestAnimationFrame(runPhysics());
  setInterval(() => {
    updatePhysics();
  }, 1000 / 60);
};