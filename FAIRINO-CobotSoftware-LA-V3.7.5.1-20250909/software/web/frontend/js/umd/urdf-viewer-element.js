(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('three'), require('three/examples/js/controls/OrbitControls'), require('./URDFLoader.js')) :
    typeof define === 'function' && define.amd ? define(['three', 'three/examples/js/controls/OrbitControls', './URDFLoader.js'], factory) :
    (global.URDFViewer = factory(global.THREE,global.THREE,global.URDFLoader));
}(this, (function (THREE,OrbitControls,URDFLoader) { 'use strict';

    URDFLoader = URDFLoader && URDFLoader.hasOwnProperty('default') ? URDFLoader['default'] : URDFLoader;

    // urdf-viewer element
    // Loads and displays a 3D view of a URDF-formatted robot

    // Events
    // urdf-change: Fires when the URDF has finished loading and getting processed
    // urdf-processed: Fires when the URDF has finished loading and getting processed
    // geometry-loaded: Fires when all the geometry has been fully loaded
    // ignore-limits-change: Fires when the 'ignore-limits' attribute changes
    // angle-change: Fires when an angle changes
    class URDFViewer extends HTMLElement {

        static get observedAttributes() {

            return ['package', 'urdf', 'real', 'virtual', 'tool', 'up', 'display-shadow', 'ambient-color', 'ignore-limits'];

        }

        get package() { return this.getAttribute('package') || ''; }
        set package(val) { this.setAttribute('package', val); }

        get urdf() { return this.getAttribute('urdf') || ''; }
        set urdf(val) { this.setAttribute('urdf', val); }

        get real() { return this.getAttribute('real') || ''; }
        set real(val) { this.setAttribute('real', val); }

        get virtual() { return this.getAttribute('virtual') || ''; }
        set virtual(val) { this.setAttribute('virtual', val); }

        get tool() { return this.getAttribute('tool') || ''; }
        set tool(val) { this.setAttribute('tool', val); }

        get ignoreLimits() { return this.hasAttribute('ignore-limits') || false; }
        set ignoreLimits(val) { val ? this.setAttribute('ignore-limits', val) : this.removeAttribute('ignore-limits'); }

        get up() { return this.getAttribute('up') || '+Z'; }
        set up(val) { this.setAttribute('up', val); }

        get displayShadow() { return this.hasAttribute('display-shadow') || false; }
        set displayShadow(val) { val ? this.setAttribute('display-shadow', '') : this.removeAttribute('display-shadow'); }

        get ambientColor() { return this.getAttribute('ambient-color') || '#455A64'; }
        set ambientColor(val) { val ? this.setAttribute('ambient-color', val) : this.removeAttribute('ambient-color'); }

        get autoRedraw() { return this.hasAttribute('auto-redraw') || false; }
        set autoRedraw(val) { val ? this.setAttribute('auto-redraw', true) : this.removeAttribute('auto-redraw'); }

        get noAutoRecenter() { return this.hasAttribute('no-auto-recenter') || false; }
        set noAutoRecenter(val) { val ? this.setAttribute('no-auto-recenter', true) : this.removeAttribute('no-auto-recenter'); }

        get angles() {

            const angles = {};
            if (this.virtualRobot) {

                for (const name in this.virtualRobot.joints) angles[name] = this.virtualRobot.joints[name].angle;

            }

            return angles;

        }
        set angles(val) { this._setAngles(val); }

        /* Lifecycle Functions */
        constructor() {

            super();

            this._requestId = 0;
            this._dirty = false;
            this._loadScheduled = false;
            this.robot = null;
            this.realRobot = null;
            this.virtualRobot = null;
            this.loadMeshFunc = null;
            this.urlModifierFunc = null;

            // Scene setup
            const scene = new THREE.Scene();
            scene.background = new THREE.Color( 0xcce0ff);

            const ambientLight = new THREE.HemisphereLight(this.ambientColor, '#000');
            ambientLight.groundColor.lerp(ambientLight.color, 0.5);
            ambientLight.intensity = 0.5;
            ambientLight.position.set(0, 1, 0);
            scene.add(ambientLight);

            // Light setup
            const dirLight = new THREE.DirectionalLight(0xffffff);
            dirLight.position.set(4, 10, 1);
            dirLight.shadow.mapSize.width = 2048;
            dirLight.shadow.mapSize.height = 2048;
            dirLight.castShadow = true;
            scene.add(dirLight);
            scene.add(dirLight.target);

            // Renderer setup
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setClearColor(0xffffff);
            renderer.setClearAlpha(0);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.gammaOutput = true;

            // Camera setup
            // const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
            const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 10;

            // World setup
            const world = new THREE.Object3D();
            world.up.set(0, 0, 1);
            scene.add(world);

            // grid setup
            const grid = new THREE.GridHelper(5, 20);
            scene.add(grid)

            // Plane setup
            // const plane = new THREE.Mesh(
            //     new THREE.PlaneBufferGeometry(2000, 2000),
            //     new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ),
            //     new THREE.ShadowMaterial({ side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
            // );
            // plane.rotation.x = -Math.PI / 2;
            // plane.position.y = -0.5;
            // plane.receiveShadow = true;
            // plane.scale.set(10, 10, 10);
            // scene.add(plane);

            // Controls setup
            const orbit = new OrbitControls.OrbitControls( camera, renderer.domElement );
            orbit.rotateSpeed = 2.0;
            orbit.zoomSpeed = 5;
            orbit.panSpeed = 2;
            orbit.enableZoom = true;
            orbit.enableDamping = false;
            // orbit.maxDistance = 50;
            // orbit.minDistance = 0.25;
            orbit.maxPolarAngle = 1.57;
            orbit.minPolarAngle = 0;
            orbit.maxDistance = 5;
            orbit.minDistance = 1;
            orbit.addEventListener( 'change', () => this.recenter() );

            var geometry = new THREE.BoxBufferGeometry( 0.1, 0.1, 0.1 );
            var material = new THREE.MeshPhongMaterial({
                color: 0xFE5000,   //材质颜色
                transparent:true,  //开启透明度
                opacity:0.3        //设置透明度具体值
            });
            var mesh = new THREE.Mesh( geometry, material );

            const controls = new THREE.TransformControls( camera, renderer.domElement );
            controls.addEventListener( 'change', (e) => {
                this.recenter();
            });

            controls.addEventListener( 'dragging-changed', function ( event ) {

                orbit.enabled = !event.value;

                document.dispatchEvent(new CustomEvent('vc-dragging', { bubbles: true, cancelable: true, detail: event.value }));
                
                if (!event.value) {
                    document.dispatchEvent(new CustomEvent('calc-move', { bubbles: true, cancelable: true, detail: mesh }));
                }

            } );

            this.scene = scene;
            this.world = world;
            this.mesh = mesh;
            this.renderer = renderer;
            this.camera = camera;
            this.orbit = orbit;
            this.controls = controls;
            this.fontLoader = new THREE.FontLoader();
            // this.plane = plane;
            this.directionalLight = dirLight;
            this.ambientLight = ambientLight;

            this.pointsVertices = [];
            this.lineNumbers = [];
            this.unitDiff = {
                j1: 0,
                j2: 0,
                j3: 0,
                j4: 0,
                j5: 0,
                j6: 0
            };
            this.DEG2RAD = Math.PI / 180;
            this.tracksGroup = new THREE.Group();
            this.pointsGroup = new THREE.Group();
            this.axesGroup0 = new THREE.Group();
            this.axesGroup1 = new THREE.Group();
            this.axesGroup2 = new THREE.Group();
            this.axesGroup3 = new THREE.Group();
            this.textGroup = new THREE.Group();

            this._setUp(this.up);

            const _renderLoop = () => {

                if (this.parentNode) {

                    this.updateSize();

                    if (this._dirty || this.autoRedraw) {

                        if (!this.noAutoRecenter) {

                            this._updateEnvironment();
                        }

                        this.renderer.render(scene, camera);
                        this._dirty = false;

                    }

                    // update controls after the environment in
                    // case the controls are retargeted
                    this.orbit.update();

                }
                this._renderLoopId = requestAnimationFrame(_renderLoop);

            };
            _renderLoop();

        }

        connectedCallback() {

            // Add our initialize styles for the element if they haven't
            // been added yet
            if (!this.constructor._styletag) {

                const styletag = document.createElement('style');

                styletag.innerHTML =
                `
                    ${ this.tagName } { display: block; }
                    ${ this.tagName } canvas {
                        width: 100%;
                        height: 100%;
                    }
                `;

                document.head.appendChild(styletag);
                this.constructor._styletag = styletag;

            }

            // add the renderer
            if (this.childElementCount === 0) {

                this.appendChild(this.renderer.domElement);

            }

            this.updateSize();
            requestAnimationFrame(() => this.updateSize());

        }

        disconnectedCallback() {

            cancelAnimationFrame(this._renderLoopId);

        }

        attributeChangedCallback(attr, oldval, newval) {

            this.recenter();

            switch (attr) {

                case 'package':
                case 'urdf':
                case 'real':
                case 'virtual':{

                    this._scheduleLoad();
                    break;

                }

                case 'tool': {

                    this._scheduleToolLoad();
                    break;
                }

                case 'up': {

                    this._setUp(this.up);
                    break;

                }

                case 'ambient-color': {

                    this.ambientLight.color.set(this.ambientColor);
                    this.ambientLight.groundColor.set('#000').lerp(this.ambientLight.color, 0.5);
                    break;

                }

                case 'ignore-limits': {

                    this._setIgnoreLimits(this.ignoreLimits, true);
                    break;

                }

            }

        }

        /* Public API */
        updateSize() {

            const r = this.renderer;
            const w = this.clientWidth;
            const h = this.clientHeight;
            const currsize = r.getSize();

            if (currsize.width !== w || currsize.height !== h) {

                this.recenter();

            }

            r.setPixelRatio(window.devicePixelRatio);
            r.setSize(w, h, false);

            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();

        }

        redraw() {

            this._dirty = true;
        }

        recenter() {

            this._updateEnvironment();
            this.redraw();

        }

        // Draw coordinate system
        // type: 0-base, 1-tool, 2-workpiece, 3-Extended axis
        displayCoordinateSystem(type, x, y, z, rx, ry, rz, len, labelText) {
            
            if (type == 0) {
                len = 0.5;    // default length of base CS: 0.5
            }

            const origin = new THREE.Vector3(0, 0, 0);
            const axisX = new THREE.Vector3(1, 0, 0);
            const axisY = new THREE.Vector3(0, 1, 0);
            const axisZ = new THREE.Vector3(0, 0, 1);

            const axisXArrow = new THREE.ArrowHelper(axisX, origin, len, 0xff0000);
            const axisYArrow = new THREE.ArrowHelper(axisY, origin, len, 0x00ff00);
            const axisZArrow = new THREE.ArrowHelper(axisZ, origin, len, 0x0000ff);

            if (type == 0) {

                this.axesGroup0 = new THREE.Group();    // base coordinate system group
    
                this.axesGroup0.add(axisXArrow);
                this.axesGroup0.add(axisYArrow);
                this.axesGroup0.add(axisZArrow);

                this.world.add(this.axesGroup0);

            } else if (type == 1) {

                this.axesGroup1 = new THREE.Group();    // tool coordinate system group

                this.axesGroup1.position.set(x, y, z);

                this.axesGroup1.add(axisXArrow);
                this.axesGroup1.add(axisYArrow);
                this.axesGroup1.add(axisZArrow);

                const quaternion = new THREE.Quaternion();
                const euler = new THREE.Euler(rx*(Math.PI/180), ry*(Math.PI/180), rz*(Math.PI/180), 'ZYX');
                quaternion.setFromEuler( euler );
                this.axesGroup1.applyQuaternion( quaternion );

                this.world.add(this.axesGroup1);

            } else if (type == 2) {

                this.axesGroup2 = new THREE.Group();    // workpiece coordinate system group

                this.axesGroup2.position.set(x, y, z);

                this.axesGroup2.add(axisXArrow);
                this.axesGroup2.add(axisYArrow);
                this.axesGroup2.add(axisZArrow);

                const quaternion = new THREE.Quaternion();
                const euler = new THREE.Euler(rx*(Math.PI/180), ry*(Math.PI/180), rz*(Math.PI/180), 'ZYX');
                quaternion.setFromEuler( euler );
                this.axesGroup2.applyQuaternion( quaternion );

                this.world.add(this.axesGroup2);
                
            } else if (type == 3) {

                this.axesGroup3 = new THREE.Group();    // Ex.axis coordinate system group

                this.axesGroup3.position.set(x, y, z);

                this.axesGroup3.add(axisXArrow);
                this.axesGroup3.add(axisYArrow);
                this.axesGroup3.add(axisZArrow);

                const quaternion = new THREE.Quaternion();
                const euler = new THREE.Euler(rx*(Math.PI/180), ry*(Math.PI/180), rz*(Math.PI/180), 'ZYX');
                quaternion.setFromEuler( euler );
                this.axesGroup3.applyQuaternion( quaternion );

                this.world.add(this.axesGroup3);
                
            }
            

            this.redraw();

        }

        clearCoordinateSystem(type) {

            if (type == 0) {

                this.axesGroup0.traverse(function (item) {

                    if (item instanceof THREE.Mesh) {
                        item.geometry.dispose();
                        item.material.dispose();
                    };
    
                });
    
                this.axesGroup0.children = [];
                
                this.world.remove(this.axesGroup0);

            } else if (type == 1) {
                
                this.axesGroup1.traverse(function (item) {

                    if (item instanceof THREE.Mesh) {
                        item.geometry.dispose();
                        item.material.dispose();
                    };
    
                });
    
                this.axesGroup1.children = [];
                
                this.world.remove(this.axesGroup1);
                
            } else if (type == 2) {

                this.axesGroup2.traverse(function (item) {

                    if (item instanceof THREE.Mesh) {
                        item.geometry.dispose();
                        item.material.dispose();
                    };
    
                });
    
                this.axesGroup2.children = [];
                
                this.world.remove(this.axesGroup2);
                
            } else if (type == 3) {

                this.axesGroup3.traverse(function (item) {

                    if (item instanceof THREE.Mesh) {
                        item.geometry.dispose();
                        item.material.dispose();
                    };
    
                });
    
                this.axesGroup3.children = [];
                
                this.world.remove(this.axesGroup3);
                
            }

            this.redraw();

        }

        // Set the joint with jointName to
        // angle in degrees
        setVirtualAngle(jointName, angle) {

            if (!this.virtualRobot) return;
            if (!this.virtualRobot.joints[jointName]) return;

            const origAngle = this.virtualRobot.joints[jointName].angle;
            const newAngle = this.virtualRobot.setAngle(jointName, angle);
            if (origAngle !== newAngle) {
                this.redraw();
            }

            this.dispatchEvent(new CustomEvent('virtual-angle-change', { bubbles: true, cancelable: true, detail: jointName }));

        }

        setAngle(jointName, angle) {

            if (!this.robot) return;
            if (!this.robot.joints[jointName]) return;

            const origAngle = this.robot.joints[jointName].angle;
            const newAngle = this.robot.setAngle(jointName, angle);
            if (origAngle !== newAngle) {
                this.redraw();
            }

            this.dispatchEvent(new CustomEvent('angle-change', { bubbles: true, cancelable: true, detail: jointName }));

        }

        setAngles(angles) {

            for (const name in angles) this.setAngle(name, angles[name]);

        }

        ExecuteSmoothMotion(virtualFlg, lastJoints, nowJoints, rate) {

            for (const name in this.unitDiff) {
                
                this.unitDiff[name] = (nowJoints[name]*this.DEG2RAD - lastJoints[name]*this.DEG2RAD)/rate;
                
            };

            for (let j = 1; j <= rate; j++) {

                for (const name in this.unitDiff) {
                    
                    this.setAngle(name, nowJoints[name]*this.DEG2RAD + this.unitDiff[name]*j);
                    if (virtualFlg) {
                        this.setVirtualAngle(name, nowJoints[name]*this.DEG2RAD + this.unitDiff[name]*j);
                    }
                    
                };
                
            };

        }

        drawPoints(x, y, z, color) {

            if(!x) return;
            if(!y) return;
            if(!z) return;
            
            this.pointsVertices.push(x,y,z);
            
            let pointsGeometry = new THREE.BufferGeometry();
            pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(this.pointsVertices, 3));
            let pointsMaterial = new THREE.PointsMaterial( {size:0.01, color: color || 0xfff} );
            let points = new THREE.Points(pointsGeometry, pointsMaterial);

            this.pointsGroup.add(points);
            this.world.add(this.pointsGroup);

            this._dirty = true;

        }

        drawTrack(x, y, z, color) {

            if(!x) return;
            if(!y) return;
            if(!z) return;

            this.pointsVertices.push(new THREE.Vector3(x, y, z));

            let geometry = new THREE.Geometry();
            geometry.vertices = this.pointsVertices;
            let material = new THREE.LineBasicMaterial( {color: color || 0xff0000} );
            let track = new THREE.Line(geometry, material);

            this.tracksGroup.add(track);

            this.world.add(this.tracksGroup);

        }

        clearPoints() {

            this.pointsVertices = [];

            this.pointsGroup.traverse(function (item) {
                
                if (item instanceof THREE.Points) {
                    item.geometry.dispose();
                    item.material.dispose();
                };

            });

            this.pointsGroup.children = [];

            this.world.remove(this.pointsGroup);

            this.redraw();
        }

        clearTrack() {

            this.pointsVertices = [];

            this.tracksGroup.traverse(function (item) {

                if (item instanceof THREE.Line) {
                    item.geometry.dispose();
                    item.material.dispose();
                    
                };

            });

            this.tracksGroup.children = [];
            
            this.world.remove(this.tracksGroup);

            this.redraw();

        }

        // 固定安装API
        changeFixedMounting(mountType) {

            if (mountType == 0) {

                // 平装
                this._setUp('+Z');

            } else if (mountType == 1) {
                
                // 侧装
                this._setUp('-X');

            } else if (mountType == 2) {

                // 吊装
                this._setUp('-Z');

            }

        }

        // 自由安装重置API
        resetFreeMounting (ly, lz) {
            const lzt = -lz*(Math.PI/180);
            const lyq = -ly*(Math.PI/180);

            this.world.rotateZ (lzt);
            this.world.rotateY (lyq);
        }

        // 自由安装API
        changeFreeMounting (yAngle, zAngle) {
            const q = yAngle*(Math.PI/180);
            const t = zAngle*(Math.PI/180);

            this.world.rotateY (q);
            this.world.rotateZ (t);
            
            this.redraw();
        }

        /* 初始化末端控制块 */
        initControlsBox(tcp) {
            this.world.add( this.mesh );
            this.mesh.position.set((tcp.x).toFixed(1) / 1000, (tcp.y).toFixed(1) / 1000, (tcp.z).toFixed(1) / 1000);
            this.mesh.rotation.set(tcp.rx * this.DEG2RAD, tcp.ry * this.DEG2RAD, tcp.rz * this.DEG2RAD);

            this.controls.attach( this.mesh );
            this.scene.add( this.controls );

        }

        updateControlsBox(tcp) {

            this.mesh.position.set((tcp.x).toFixed(1) / 1000, (tcp.y).toFixed(1) / 1000, (tcp.z).toFixed(1) / 1000);
            this.mesh.rotation.set(tcp.rx * this.DEG2RAD, tcp.ry * this.DEG2RAD, tcp.rz * this.DEG2RAD);

        }

        setTransformMode(modeCode) {
            if (modeCode == 0) {
                this.controls.setMode( "translate" );
            } else if (modeCode == 1) {
                this.controls.setMode( "rotate" );
            }
        }

        showRobotType(robotType, textPosition) {
            var _self = this;
            this.fontLoader.load('fonts/Chinese_Regular.json', function(font) {
                const robotTypeGeometry = new THREE.TextGeometry(`${robotType.type} ${robotType.stiffness}`,{
                    font: font,
                    size: 4,
                    height: 0.1,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 0.01,
                    bevelSize: 0,
                    bevelOffset: 0,
                    bevelSegments: 3
                });
                var robotTypeMaterial = new THREE.MeshBasicMaterial({
                    color: 0x424242
                });
                var robotTypeMesh = new THREE.Mesh( robotTypeGeometry, robotTypeMaterial );
                // 将机器人型号和刚度信息沿X轴旋转90°，垂直显示
                // robotTypeMesh.geometry.rotateX(Math.PI / 2);
                // 设置机器人型号和刚度信息的位置
                robotTypeMesh.position.set(textPosition.x, textPosition.y, textPosition.z)
                robotTypeMesh.scale.set(0.03, 0.03, 0.03)
                _self.scene.add(robotTypeMesh);
                _self.redraw();
            })
        }

        /* Private Functions */
        // Updates the position of the plane to be at the
        // lowest point below the robot and focuses the
        // camera on the center of the scene
        _updateEnvironment() {

            if (!this.robot) return;

            this.world.updateMatrixWorld();

            const bbox = new THREE.Box3();
            const temp = new THREE.Box3();

            this.robot.traverse(c => {

                const geometry = c.geometry;
                if (geometry) {

                    if (geometry.boundingBox === null) {

                        geometry.computeBoundingBox();

                    }

                    temp.copy(geometry.boundingBox);
                    temp.applyMatrix4(c.matrixWorld);

                    bbox.union(temp);

                }

            });

            this.virtualRobot.traverse(c => {

                const geometry = c.geometry;
                if (geometry) {

                    if (geometry.boundingBox === null) {

                        geometry.computeBoundingBox();

                    }

                    temp.copy(geometry.boundingBox);
                    temp.applyMatrix4(c.matrixWorld);

                    bbox.union(temp);

                }

            });

            const center = bbox.getCenter(new THREE.Vector3());
            this.orbit.target.y = center.y;
            // this.plane.position.y = bbox.min.y - 1e-3;

            const dirLight = this.directionalLight;
            dirLight.castShadow = this.displayShadow;

            if (this.displayShadow) {

                // Update the shadow camera rendering bounds to encapsulate the
                // model. We use the bounding sphere of the bounding box for
                // simplicity -- this could be a tighter fit.
                const sphere = bbox.getBoundingSphere(new THREE.Sphere());
                const minmax = sphere.radius;
                const cam = dirLight.shadow.camera;
                cam.left = cam.bottom = -minmax;
                cam.right = cam.top = minmax;

                // Update the camera to focus on the center of the model so the
                // shadow can encapsulate it
                const offset = dirLight.position.clone().sub(dirLight.target.position);
                dirLight.target.position.copy(center);
                dirLight.position.copy(center).add(offset);

                cam.updateProjectionMatrix();

            }

        }

        _scheduleLoad() {

            // if our current model is already what's being requested
            // or has been loaded then early out
            // if (this._prevload === `${ this.package }|${ this.urdf }`) return;
            // this._prevload = `${ this.package }|${ this.urdf }`;
            // if (this._prevload === `${ this.package }|${ this.urdfReal }`) return;
            // this._prevload = `${ this.package }|${ this.urdfReal }`;
            // if (this._prevload === `${ this.package }|${ this.urdfVirtual }`) return;
            // this._prevload = `${ this.package }|${ this.urdfVirtual }`;

            // if we're already waiting on a load then early out
            if (this._loadScheduled) return;
            this._loadScheduled = true;

            // if (this.robot) {

            //     this.robot.traverse(c => c.dispose && c.dispose());
            //     this.robot.parent.remove(this.robot);
            //     this.robot = null;

            // }

            requestAnimationFrame(() => {
                // this._loadUrdf(this.package, this.urdf);
                this._loadRealUrdf(this.package, this.real);
                this._loadScheduled = false;

            });

        }

        // Watch the package and urdf field and load the robot model.
        // This should _only_ be called from _scheduleLoad because that
        // ensures the that current robot has been removed
        _loadUrdf(pkg, urdf) {

            // this.dispatchEvent(new CustomEvent('urdf-change', { bubbles: true, cancelable: true, composed: true }));

            if (urdf) {

                // Keep track of this request and make
                // sure it doesn't get overwritten by
                // a subsequent one
                this._requestId++;
                const requestId = this._requestId;

                // 负责模型阴影的生成
                const updateMaterials = mesh => {

                    mesh.traverse(c => {

                        if (c.isMesh) {

                            c.castShadow = true;
                            c.receiveShadow = true;

                            if (c.material) {

                                const mats =
                                    (Array.isArray(c.material) ? c.material : [c.material])
                                        .map(m => {

                                            if (m instanceof THREE.MeshBasicMaterial) {

                                                m = new THREE.MeshPhongMaterial();

                                            }

                                            if (m.map) {

                                                m.map.encoding = THREE.GammaEncoding;

                                            }

                                            return m;

                                        });
                                c.material = mats.length === 1 ? mats[0] : mats;

                            }

                        }

                    });

                };

                if (pkg.includes(':') && (pkg.split(':')[1].substring(0, 2)) !== '//') {
                    // E.g. pkg = "pkg_name: path/to/pkg_name, pk2: path2/to/pk2"}

                    // Convert pkg(s) into a map. E.g.
                    // { "pkg_name": "path/to/pkg_name",
                    //   "pk2":      "path2/to/pk2"      }

                    pkg = pkg.split(',').reduce((map, value) => {

                        const split = value.split(/:/).filter(x => !!x);
                        const pkgName = split.shift().trim();
                        const pkgPath = split.join(':').trim();
                        map[pkgName] = pkgPath;

                        return map;

                    }, {});
                }

                let robot = null;
                const manager = new THREE.LoadingManager();
                manager.onLoad = () => {

                    // If another request has come in to load a new
                    // robot, then ignore this one
                    if (this._requestId !== requestId) {

                        robot.traverse(c => c.dispose && c.dispose());
                        return;

                    }

                    this.robot = robot;
                    this.world.add(robot);
                    updateMaterials(robot);

                    this._setIgnoreLimits(this.ignoreLimits);

                    setTimeout(() => {
                        this.dispatchEvent(new CustomEvent('urdf-processed', { bubbles: true, cancelable: true, composed: true }));
                        this.dispatchEvent(new CustomEvent('geometry-loaded', { bubbles: true, cancelable: true, composed: true }));
                    }, 1000);

                    this.recenter();

                };

                let count = 0;
                manager.onProgress = (urdf) => {

                    count++;
                    this.dispatchEvent(new CustomEvent('load-percentage', { bubbles: true, cancelable: true, composed: true, detail: parseInt(count / 8 * 100) + "%"}));

                }

                if (this.urlModifierFunc) {

                    manager.setURLModifier(this.urlModifierFunc);

                }

                const loader = new URDFLoader(manager);
                loader.packages = pkg;
                loader.loadMeshCb = this.loadMeshFunc;
                loader.fetchOptions = { mode: 'cors', credentials: 'same-origin' };
                loader.load(urdf, model => robot = model);

            }

        }

        // real robot
        _loadRealUrdf(pkg, urdf) {

            // this.dispatchEvent(new CustomEvent('urdf-change', { bubbles: true, cancelable: true, composed: true }));

            if (urdf) {

                // Keep track of this request and make
                // sure it doesn't get overwritten by
                // a subsequent one
                // this._requestId++;
                // const requestId = this._requestId;

                // 负责模型阴影的生成
                const updateMaterials = (mesh, isReal) => {

                    mesh.traverse(c => {

                        if (c.isMesh) {

                            c.castShadow = true;
                            c.receiveShadow = true;

                            if (c.material) {

                                if (isReal) {

                                    const mats =
                                        (Array.isArray(c.material) ? c.material : [c.material])
                                            .map(m => {
    
                                                if (m instanceof THREE.MeshBasicMaterial) {
    
                                                    m = new THREE.MeshPhongMaterial();
    
                                                }
    
                                                if (m.map) {
    
                                                    m.map.encoding = THREE.GammaEncoding;
    
                                                }
    
                                                return m;
    
                                            });
                                    c.material = mats.length === 1 ? mats[0] : mats;
                                    
                                } else {
                                    
                                    c.material = new THREE.MeshPhongMaterial({
                                        color: 0xFE5000,   //材质颜色
                                        transparent:true,  //开启透明度
                                        opacity:0.3        //设置透明度具体值
                                    });

                                }

                            }

                        }

                    });

                };

                if (pkg.includes(':') && (pkg.split(':')[1].substring(0, 2)) !== '//') {
                    // E.g. pkg = "pkg_name: path/to/pkg_name, pk2: path2/to/pk2"}

                    // Convert pkg(s) into a map. E.g.
                    // { "pkg_name": "path/to/pkg_name",
                    //   "pk2":      "path2/to/pk2"      }

                    pkg = pkg.split(',').reduce((map, value) => {

                        const split = value.split(/:/).filter(x => !!x);
                        const pkgName = split.shift().trim();
                        const pkgPath = split.join(':').trim();
                        map[pkgName] = pkgPath;

                        return map;

                    }, {});
                }

                let realRobot = null;
                let virtualRobot = null;
                const manager = new THREE.LoadingManager();
                manager.onLoad = () => {

                    // If another request has come in to load a new
                    // robot, then ignore this one
                    // if (this._requestId !== requestId) {

                    //     robot.traverse(c => c.dispose && c.dispose());
                    //     return;

                    // }

                    this.robot = realRobot;
                    this.world.add(realRobot);
                    this.virtualRobot = virtualRobot;
                    this.world.add(virtualRobot);
                    updateMaterials(realRobot, true);
                    updateMaterials(virtualRobot, false);

                    this._setIgnoreLimits(this.ignoreLimits);

                    setTimeout(() => {
                        this.dispatchEvent(new CustomEvent('urdf-processed', { bubbles: true, cancelable: true, composed: true }));
                        this.dispatchEvent(new CustomEvent('geometry-loaded', { bubbles: true, cancelable: true, composed: true }));
                    }, 1000);
                    // this._loadVirtualUrdf(this.package, this.real);

                    this.recenter();

                };

                this.count = 0;
                manager.onProgress = () => {

                    let linkTotal = Object.keys(realRobot.links).length + 1;

                    this.count++;
                    this.dispatchEvent(new CustomEvent('load-percentage', { bubbles: true, cancelable: true, composed: true, detail: parseInt(this.count / linkTotal * 100) + "%"}));

                }

                if (this.urlModifierFunc) {

                    manager.setURLModifier(this.urlModifierFunc);

                }

                const loader = new URDFLoader(manager);
                loader.packages = pkg;
                loader.loadMeshCb = this.loadMeshFunc;
                loader.fetchOptions = { mode: 'cors', credentials: 'same-origin' };
                loader.load(urdf, (model1, model2) => {realRobot = model1; virtualRobot = model2});

            }

        }

        // virtual robot (方法弃用 v3.7.4-240630)
        _loadVirtualUrdf(pkg, urdf) {

            // this.dispatchEvent(new CustomEvent('urdf-change', { bubbles: true, cancelable: true, composed: true }));

            if (urdf) {

                // Keep track of this request and make
                // sure it doesn't get overwritten by
                // a subsequent one
                // this._requestId++;
                // const requestId = this._requestId;

                // 负责模型阴影的生成
                const updateMaterials = mesh => {

                    mesh.traverse(c => {

                        if (c.isMesh) {

                            // c.castShadow = true;
                            // c.receiveShadow = true;

                            if (c.material) {

                                // const mats =
                                //     (Array.isArray(c.material) ? c.material : [c.material])
                                //         .map(m => {

                                //             if (m instanceof THREE.MeshBasicMaterial) {

                                //                 m = new THREE.MeshPhongMaterial({
                                //                     color: 0x0000ff,   //材质颜色
                                //                     transparent:true,  //开启透明度
                                //                     opacity:0.1        //设置透明度具体值
                                //                 });

                                //             }

                                //             if (m.map) {

                                //                 m.map.encoding = THREE.GammaEncoding;

                                //             }

                                //             return m;

                                //         });
                                // c.material = mats.length === 1 ? mats[0] : mats;
                                c.material = new THREE.MeshPhongMaterial({
                                    color: 0xFE5000,   //材质颜色
                                    transparent:true,  //开启透明度
                                    opacity:0.3        //设置透明度具体值
                                });

                            }

                        }

                    });

                };

                if (pkg.includes(':') && (pkg.split(':')[1].substring(0, 2)) !== '//') {
                    // E.g. pkg = "pkg_name: path/to/pkg_name, pk2: path2/to/pk2"}

                    // Convert pkg(s) into a map. E.g.
                    // { "pkg_name": "path/to/pkg_name",
                    //   "pk2":      "path2/to/pk2"      }

                    pkg = pkg.split(',').reduce((map, value) => {

                        const split = value.split(/:/).filter(x => !!x);
                        const pkgName = split.shift().trim();
                        const pkgPath = split.join(':').trim();
                        map[pkgName] = pkgPath;

                        return map;

                    }, {});
                }

                let virtualRobot = null;
                const manager = new THREE.LoadingManager();
                manager.onLoad = () => {

                    // If another request has come in to load a new
                    // robot, then ignore this one
                    // if (this._requestId !== requestId) {

                    //     robot.traverse(c => c.dispose && c.dispose());
                    //     return;

                    // }

                    this.virtualRobot = virtualRobot;
                    this.world.add(virtualRobot);
                    updateMaterials(virtualRobot);

                    this._setIgnoreLimits(this.ignoreLimits);

                    setTimeout(() => {
                        this.dispatchEvent(new CustomEvent('urdf-processed', { bubbles: true, cancelable: true, composed: true }));
                        this.dispatchEvent(new CustomEvent('geometry-loaded', { bubbles: true, cancelable: true, composed: true }));
                    }, 1000);

                    this.recenter();

                };

                manager.onProgress = (urdf) => {

                    this.count++;
                    this.dispatchEvent(new CustomEvent('load-percentage', { bubbles: true, cancelable: true, composed: true, detail: parseInt(this.count / 16 * 100) + "%"}));

                }

                if (this.urlModifierFunc) {

                    manager.setURLModifier(this.urlModifierFunc);

                }

                const loader = new URDFLoader(manager);
                loader.packages = pkg;
                loader.loadMeshCb = this.loadMeshFunc;
                loader.fetchOptions = { mode: 'cors', credentials: 'same-origin' };
                loader.load(urdf, model => virtualRobot = model);

            }

        }

        _scheduleToolLoad() {

            requestAnimationFrame(() => {

                this._loadTool(this.tool);
    
            });

        }

        _loadTool(tool) {

            this.dispatchEvent(new CustomEvent('tool-change', { bubbles: true, cancelable: true, composed: true }));

            const updateMaterials = mesh => {

                mesh.traverse(c => {

                    if (c.isMesh) {

                        c.castShadow = true;
                        c.receiveShadow = true;

                        if (c.material) {

                            const mats =
                                (Array.isArray(c.material) ? c.material : [c.material])
                                    .map(m => {

                                        if (m instanceof THREE.MeshBasicMaterial) {

                                            m = new THREE.MeshPhongMaterial();

                                        }

                                        if (m.map) {

                                            m.map.encoding = THREE.GammaEncoding;

                                        }

                                        return m;

                                    });
                            c.material = mats.length === 1 ? mats[0] : mats;

                        }

                    }

                });

            };

            let robot = null;
            const manager = new THREE.LoadingManager();
            manager.onLoad = () => {

                this.robot = robot;
                this.world.add(robot);
                updateMaterials(robot);

                this.dispatchEvent(new CustomEvent('tool-loaded', { bubbles: true, cancelable: true, composed: true }));

                this.recenter();

            };

            manager.onProgress = (urdf) => {

                console.log("Loading: " + urdf);

            }

            if (this.urlModifierFunc) {

                manager.setURLModifier(this.urlModifierFunc);

            }

            const loader = new URDFLoader(manager);
            loader.loadMeshCb = this.loadMeshFunc;
            loader.loadTool(this.robot, tool, model => robot = model);

        }

        // Watch the coordinate frame and update the
        // rotation of the scene to match
        _setUp(up) {

            if (!up) up = '+Z';
            up = up.toUpperCase();
            const sign = up.replace(/[^-+]/g, '')[0] || '+';
            const axis = up.replace(/[^XYZ]/gi, '')[0] || 'Z';

            const PI = Math.PI;
            const HALFPI = PI / 2;
            if (axis === 'X') this.world.rotation.set(0, 0, sign === '+' ? HALFPI : -HALFPI);
            if (axis === 'Z') this.world.rotation.set(sign === '+' ? -HALFPI : HALFPI, 0, 0);
            if (axis === 'Y') this.world.rotation.set(sign === '+' ? 0 : PI, 0, 0);

        }

        // Updates the current robot's angles to ignore
        // joint limits or not
        _setIgnoreLimits(ignore, dispatch = false) {

            if (this.robot) {

                Object
                    .values(this.robot.joints)
                    .forEach(joint => {

                        joint.ignoreLimits = ignore;
                        joint.setAngle(joint.angle);

                    });

            }

            if (dispatch) {

                this.dispatchEvent(new CustomEvent('ignore-limits-change', { bubbles: true, cancelable: true, composed: true }));

            }

        }

    }

    return URDFViewer;

})));