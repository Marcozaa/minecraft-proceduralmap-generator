import { 
  WebGLRenderer, ACESFilmicToneMapping, sRGBEncoding, Vector3,
  Color, CylinderGeometry, PointsMaterial, Points, PlaneGeometry, AxesHelper,
  RepeatWrapping, DoubleSide, BoxGeometry, Mesh,MeshBasicMaterial, PointLight, MeshPhysicalMaterial, PerspectiveCamera,
  Scene, PMREMGenerator, PCFSoftShadowMap, FloatType,  BufferGeometry, AdditiveBlending,
  Vector2, TextureLoader, SphereGeometry, MeshStandardMaterial, AmbientLight, BufferAttribute
} from 'https://cdn.skypack.dev/three@0.137';
import { OrbitControls } from 'https://cdn.skypack.dev/three-stdlib@2.8.5/controls/OrbitControls';
import { RGBELoader } from 'https://cdn.skypack.dev/three-stdlib@2.8.5/loaders/RGBELoader';
import { mergeBufferGeometries } from 'https://cdn.skypack.dev/three-stdlib@2.8.5/utils/BufferGeometryUtils';
import SimplexNoise from 'https://cdn.skypack.dev/simplex-noise';





const scene = new Scene();
scene.background = new Color("#FFEECC");


const axesHelper = new AxesHelper( 5 );
scene.add( axesHelper );


const camera = new PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(-17,31,33);

const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = ACESFilmicToneMapping;
renderer.outputEncoding = sRGBEncoding;
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

/**
 *  PARTICLES
 */
const textureLoader = new TextureLoader()




const light = new PointLight( new Color("#FFCB8E").convertSRGBToLinear().convertSRGBToLinear(), 190, 200 );
light.position.set(13,35,48);

light.castShadow = true; 
light.shadow.mapSize.width = 512; 
light.shadow.mapSize.height = 512; 
light.shadow.camera.near = 0.5; 
light.shadow.camera.far = 500; 
scene.add( light );

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0,0,0)
controls.dampingFactor = 0.05;
controls.enableDamping = true


// Biomi
const MAX_HEIGHT = 12
const SNOW_HEIGHT = MAX_HEIGHT * 0.71;
const STONE_HEIGHT = MAX_HEIGHT * 0.9;
const DIRT_HEIGHT = MAX_HEIGHT * 0.88;
const GRASS_HEIGHT = MAX_HEIGHT * 0.45;
const SAND_HEIGHT = MAX_HEIGHT * 0.4;
const DIRT2_HEIGHT = MAX_HEIGHT * 0.25;
const WATER_HEIGHT = MAX_HEIGHT * 0;

/**
const Foresta = {
    MAX_HEIGHT = 3,
    STONE_HEIGHT: MAX_HEIGHT * 1,


}
 */
let envmap;





(async function(){


    // Threejs processa la environment map in odo da poterla usare nei materials
    let pmrem = new PMREMGenerator(renderer)
    let envmapTexture = await new RGBELoader().setDataType(FloatType).loadAsync("assets/envmap.hdr")
    envmap = pmrem.fromEquirectangular(envmapTexture).texture



     let textures = {
    dirt: await new TextureLoader().loadAsync("assets/dirt.png"),
    dirt2: await new TextureLoader().loadAsync("assets/dirtMinecraft.jpg"),
    grass: await new TextureLoader().loadAsync("assets/grass.jpg"),
    sand: await new TextureLoader().loadAsync("assets/snow.jpg"),
    water: await new TextureLoader().loadAsync("assets/water2.jpg"),
    stone: await new TextureLoader().loadAsync("assets/stone.png"),
    snow: await new TextureLoader().loadAsync("assets/snow.jpg"),
  };



    const simplex = new SimplexNoise(Math.random() * 10000000000010);

    var grandezza = 20;




    // Creazione esagoni
    for(let i =-grandezza ; i< grandezza; i++){
        
        for(let j=-grandezza; j<grandezza; j++){
            /**
             *  Numero random per creazione di alberi su casella proceduralmente
             *  */ 
            var treeRandom = Math.floor(Math.random() * 12345)
            let position = new tileToPosition(i,j) // Posizionamento cilindro pattern ape

            
            let noise = (simplex.noise2D(i* 0.1, j * 0.1)+1)*0.3
            noise = Math.pow(noise, 1)// Montagne piu ripide


            /**
             *  Se contemporaneamente si avverano le seguenti condizioni:
             *  - Numero random divisibile per 67
             *  - Altezza blocco sopra gli 0.85 ( Sopra lo strato acquoso)
             * 
             *  creo un albero
             */
            if(treeRandom%67==0 && noise * MAX_HEIGHT> 0.85){
            makeHex(Math.round(noise * 33)+1, position)

            makeChioma((Math.round(noise * 33)+1)*2, position) 
            console.log(position)
            }else{
            makeHex(Math.round(noise * MAX_HEIGHT)+1, position) // round per normalizzazione altezza, 0x,0y position: ;
            }
        }
    }

    
function tileToPosition(tileX, tileY) {
  return new Vector2(tileX  * 1.77, tileY * 1.535);
  // return new Vector2((tileX + (tileY % 2) * 0.5) * 1.77, tileY * 1.535);
}
    
   

        let stoneMesh = hexMesh(stoneGeo, textures.stone); // Crea nuova mesh fondendo tutti gli esagoni di una categoria e il material corrispondente
        let grassMesh = hexMesh(grassGeo, textures.grass);
        let dirt2Mesh = hexMesh(dirt2Geo, textures.dirt2);
        let dirtMesh  = hexMesh(dirtGeo, textures.dirt);
        let sandMesh  = hexMesh(sandGeo, textures.sand);
        let waterMesh  = hexMesh(waterGeo, textures.water);
        let snowMesh  = hexMesh(snowGeo, textures.snow);
        let chiomaMesh = hexMesh(chiomaGeo, textures.snow)
        scene.add(stoneMesh, dirtMesh, dirt2Mesh, sandMesh, grassMesh, waterMesh, snowMesh, chiomaMesh);


        let x=0;
        let y=0
    renderer.setAnimationLoop(() => {  // Render loop, eseguita 60 frame al secondo (aggiornamento)
        controls.update()
        renderer.render(scene, camera);
    })
})()

// Ogni tipo di terreno avrà la sua Geometry
let stoneGeo = new BoxGeometry(0,0,0); // StoneGeo conterrà TUTTI gli hexagon di stone
let dirtGeo = new BoxGeometry(0,0,0); // StoneGeo conterrà TUTTI gli hexagon di terra
let dirt2Geo = new BoxGeometry(0,0,0); // ...
let sandGeo = new BoxGeometry(0,0,0);
let grassGeo = new BoxGeometry(0,0,0);
let waterGeo = new BoxGeometry(0,0,0);
let snowGeo = new BoxGeometry(0,0,0);
let chiomaGeo = new BoxGeometry(0,0,0)

function hexGeometry(height, position){
    let geo = new BoxGeometry(1.75,height,1.6) // Creeremo esagoni con la geometria cilindrica (6 lati, quarto parametro)
    // provare let geo = new BoxGeometry(2,1, 2)
    geo.translate(position.x, height * 0.5, position.y) // posizione passata nei parametri
    return geo
}


function makeHex(height, position){
    let geo = hexGeometry(height, position);
    if(height > STONE_HEIGHT){ // Se siamo a livello pietra
        stoneGeo = mergeBufferGeometries([geo, stoneGeo]) // Uniamo tutti gli esagoni di pietra in una sola geometry (StoneGeo) con mergeBufferGeomtries
    } else if(height > DIRT_HEIGHT){ 
        dirtGeo = mergeBufferGeometries([geo, dirtGeo]) 
    } else if(height > GRASS_HEIGHT){ 
        grassGeo = mergeBufferGeometries([geo, grassGeo]) 
    } else if(height > SAND_HEIGHT){ 
        sandGeo = mergeBufferGeometries([geo, sandGeo]) 
    } else if(height > DIRT2_HEIGHT){ 
        dirt2Geo = mergeBufferGeometries([geo, dirt2Geo]) 
    } else if(height > WATER_HEIGHT){ 
        waterGeo = mergeBufferGeometries([geo, waterGeo]) 
    } else if(height > SNOW_HEIGHT){ 
        snowGeo = mergeBufferGeometries([geo, snowGeo]) 
    } 
}

/**
 *  Generazione chioma albero
 */
function makeChioma(height, position){
    let chioma = chiomaGeometry(height, position)
    chiomaGeo = mergeBufferGeometries([chioma, chiomaGeo])
}
function chiomaGeometry(height, position){
    let geo = new BoxGeometry(1.75,height,1.6) // Creeremo esagoni con la geometria cilindrica (6 lati, quarto parametro)
    // provare let geo = new BoxGeometry(2,1, 2)
    geo.translate(position.x, height + 1, position.y) // posizione passata nei parametri
    return geo
}
function hexMesh(geo, map) { // Creazione mesh per materiale, geo=FusioneMeshMateriale - map=textures.materiale
  let mat = new MeshPhysicalMaterial({ 
    envMap: envmap, 
    envMapIntensity: 0.13,  // Intensity of the baked light. Default is 1.
    flatShading: true,
    map , // Texture
  });

  let mesh = new Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true; 
  
  return mesh;
}