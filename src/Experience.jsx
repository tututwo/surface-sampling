import { extend, useFrame, useThree, useLoader } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useRef, useMemo } from "react";

import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

extend({ OrbitControls: OrbitControls }); // declarative name on the left, original name on the right
export default function Experience() {
    //TODO 0. Prepare geometry
    //* earth mesh
    let simpleMaterial = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0x000000,
        transparent: true,
        opacity: 0.05,
    });
    const {
        nodes,
        materials,
        scene: { children },
    } = useGLTF("./NOVELO_EARTH.gltf");

    const continentMesh = children[0].children[0]
    continentMesh.position.set(100, 100, 100)
    const sampler = new MeshSurfaceSampler(continentMesh).build();
    //* torus alternative
    // const geometry = new THREE.TorusKnotGeometry(4, 1.3, 100, 16);
    // const torus = new THREE.Mesh(geometry);
    // const sampler = new MeshSurfaceSampler(torus).build();

    const spheres = useRef();
    const pointsCount = 10000;

    //TODO 1. Sample 10000 points and store them in an array
    const vertices = [];
    const colors = [];
    const tempPosition = new THREE.Vector3();

    for (let i = 0; i < pointsCount; i++) {
        sampler.sample(tempPosition);
        vertices.push(tempPosition.x, tempPosition.y, tempPosition.z);
    }

    let positions = useMemo(() => {
        return new THREE.Float32BufferAttribute(vertices, 3);
    }, [vertices]);

    /* Define the colors we want */

    function addPoint() {
        /* Sample a new point */
        sampler.sample(tempPosition);
        /* Push the point coordinates */
        vertices.push(tempPosition.x, tempPosition.y, tempPosition.z);
        /* Update the position attribute with the new coordinates */
        positions = new THREE.Float32BufferAttribute(vertices, 3);

        /* Get a random color from the palette */
        const color = palette[Math.floor(Math.random() * palette.length)];
        /* Push the picked color */
        colors.push(color.r, color.g, color.b);
        /* Update the color attribute with the new colors */
        usedColor = new THREE.Float32BufferAttribute(colors, 3);
    }

    //TODO Orbitcontrol
    // provide me the same state at the beginning of the component
    // const three = useThree(); // there is even three.clocl etc here
    const { camera, gl } = useThree();
    camera.position.z = 250;
    camera.position.y = 100;

    const earthRef = useRef(); //? just like bind:this in Svelte

    useFrame((state) => {
        if (spheres.current)
            // spheres.current.rotation.z = state.clock.elapsedTime * 0.5;
        spheres.current.rotation.y = state.clock.elapsedTime * 0.7;
    });
    //     <mesh ref={toruaRef}>
    //     <torusKnotGeometry></torusKnotGeometry>
    //     <meshBasicMaterial wireframe color="red"></meshBasicMaterial>
    // </mesh>

    return (
        <>
            {/* {must be lower case orbitcontrol because it's from three} */}
            <orbitControls args={[camera, gl.domElement]}></orbitControls>
            <points ref={spheres}>
                <bufferGeometry>
                    <bufferAttribute
                        onUpdate={(self) => (self.needsUpdate = true)}
                        attach="attributes-position"
                        array={positions.array}
                        itemSize={3}
                        count={pointsCount}
                    />
                </bufferGeometry>

                <pointsMaterial
                    color="red"
                    size={3}
                    alphaTest={0.2}
                    map={new THREE.TextureLoader().load(
                        "https://assets.codepen.io/127738/dotTexture.png"
                    )}
                    vertexColors={"true"}
                />
            </points>
            {/* <Earth refs={earthRef}></Earth> */}
        </>
    );
}
