import * as THREE from "three";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MaterialReducer } from "three/addons/external/MaterialReducer.js";
import Stats from "three/addons/libs/stats.module.js";
let zoomOnScreen = (c, d) => {
    if (_pm.mobile) {
        if ((c == !0 && magnify.enabled == "once") || (c == "once" && c != magnify.enabled && magnify.enabled == !0)) {
            magnify.enabled = c;
        } else return;
        if (magnify.enabled) {
            if (magnify.mobile) {
                if (d) delete magnify.enabled;
                delete magnify.mobile;
                delete magnify.grow;
            } else snapRender((magnify.grow = magnify.mobile = !0));
        }
    } else setCursor(!1);
},
loadBehaviours = async (d) => {
    const { behaviours } = await import("three/addons/inputs/behaviours.js");
    register.crowd = {
        behaviour: {},
        interval: setInterval(async () => {
            register.crowd.index = register.crowd.index && Object.keys(register.crowd.index).length > 0 ? register.crowd.index : structuredClone(register.crowd.behaviour);
            d.uid = Object.keys(register.crowd.index)[0];
            delete register.crowd.index[d.uid];
            d.mesh = _pm.model.getMesh({ p: "name", k: register.user.uid[d.uid] });
            if (register.crowd.behaviour[d.uid]) {
                d.do = register.crowd.behaviour[d.uid].do({ _b: d.mesh.userData.behaviour });
                if (!d.do.actions) {
                    d.t = d.do.destinations[Math.floor(Math.random() * d.do.destinations.length)];
                    register.user.destinations[d.uid] = new THREE.Vector3();
                    if (d.t.match(/(come)/)) register.avatar.meshes[register.user.uid[_pm.user.uid]].getWorldPosition(register.user.destinations[d.uid]);
                } else if (register.user.destinations[d.uid]) {
                    register.user.inputs[d.uid] = { walk: 0, stir: 0, yaw: 0, elev: 0, jump: d.mesh.userData.isDriving };
                    delete register.user.destinations[d.uid];
                } else _pm.model.loadAvatarAnimation({ name: d.do.actions[Math.floor(Math.random() * d.do.actions.length)], mesh: d.mesh, loop: !1, fadeIn: .42 });
            }
        }, (Math.floor(Math.random() * 13) + 7) * 420),
    };
    _pm.behaviours = behaviours;
},
showSprites = (op) => {
    if (op !== undefined) {
        if (!op.retour && !op.toTour) {
            if (_pm.p.hiddenSprites)
                for (let i = 0; i < _pm.p.hiddenSprites.length; i++) {
                    op.mesh = scene.getObjectByName(_pm.p.hiddenSprites[i]);
                    if (op.mesh) op.mesh.visible = !0;
                }
            _pm.p.hiddenSprites = [];
            if (op.hide)
                for (let i = 0; i < op.hide.length; i++) {
                    _pm.p.hiddenSprites.push(op.hide[i]);
                    op.mesh = scene.getObjectByName(op.hide[i]);
                    if (op.mesh) op.mesh.visible = !1;
                }
        } else if ((op.retour && op.retour.visible) || op.toTour.visible)
            for (let i = 0, j = op.toTour && op.toTour.visible ? op.toTour.visible : op.retour.visible; i < j.length; i++) {
                op.mesh = scene.getObjectByName(j[i]);
                if (op.mesh) op.mesh.visible = !0;
            }
    }
    register.animation.update = register.loaded = !0;
},
showHideViewButtons = (d) => {
    for (let i = 0, j = ["show", "hide"]; i < j.length; i++)
        if (d[j[i]])
            for (let k = 0, l; k < d[j[i]].length; k++) {
                l = document.getElementById(d[j[i]][k]);
                if (l) {
                    l.style.display = j[i].match(/(hide)/) ? "none" : "flex";
                    _pm.p.avatar.enabled = j[i].match(/(hide)/) ? 1 : !1;
                    controls.maxDistance = _pm.p.camera.maxDistance;
                }
            }
    delete register.user.movemarker;
},
showNavigationMarker = (d) => {
    if (register.avatar.level.navigation && register.avatar.intersects && register.avatar.intersects.length > 0) register.user.movemarker = { point: (register.avatar.targets[register.user.uid[_pm.user.uid]] = register.avatar.intersects[0].point) };
},
navigateToDestination = (d) => {
    if (_pm.physics) {
        d.e = document.getElementById("move-here-marker");
        if (d.e) {
            if (register.user.movemarker) {
                d.vector = new THREE.Vector3();
                d.vector.copy(register.user.movemarker.point);
                d.vector.project(camera);
                d.e.style.left = `${((d.vector.x + 1) / 2) * renderer.domElement.clientWidth - d.e.clientWidth / 2}px`;
                d.e.style.top = `${((-d.vector.y + 1) / 2) * renderer.domElement.clientHeight - d.e.clientHeight / 2}px`;
                d.e.style.display = "block";
            } else d.e.style.display = "none";
        }
        _pm.physics.setNavigationInputs({});
        if (register.user) for (let k in register.user.inputs) if (register.user.inputs[k]) _pm.physics.userControls({ inputs: register.user.inputs[k], uid: k });
    }
},
findMaterial = (d) => {
    scene.traverse(async (c) => {
        if (c.material && c.material.name == d.n) return c.material;
    });
},
loadShadow = (d) => {
    if (_pm.p.models[d.index].shadow) {
        new THREE.TextureLoader()
            .setCrossOrigin("anonymous")
            .setPath(`${_pm.public}assets/textures/shadows/`)
            .load(_pm.p.models[d.index].shadow.name, (texture) => {
                if (_pm.p.models) {
                    register.mesh = new THREE.Mesh(
                        new THREE.PlaneGeometry(_pm.p.models[d.index].shadow.width, _pm.p.models[d.index].shadow.height),
                        new THREE.MeshBasicMaterial({ map: texture, blending: THREE.MultiplyBlending, toneMapped: !1, transparent: !0, premultipliedAlpha: !0 })
                    );
                    register.mesh.rotation.x = -Math.PI / 2;
                    for (let i = 0, j = ["rotation", "position", "scale"]; i < j.length; i++) {
                        if (_pm.p.models[d.index].shadow[j[i]])
                            register.mesh[j[i]].set(
                                (i == 0 ? Math.PI / 180 : 1) * _pm.p.models[d.index].shadow[j[i]].x,
                                (i == 0 ? Math.PI / 180 : 1) * _pm.p.models[d.index].shadow[j[i]].y,
                                (i == 0 ? Math.PI / 180 : 1) * _pm.p.models[d.index].shadow[j[i]].z
                            );
                    }
                    register.mesh.name = "mesh shadow";
                    scene.add(register.mesh);
                    delete register.mesh;
                }
                texture.dispose();
            });
    }
},
setAudio = (d) => {
    if (!d.mesh.userData.audio) scene.add((d.mesh.userData.audio = new THREE.PositionalAudio(camera.userData.listener)));
    d.pos = new THREE.Vector3();
    d.mesh.getWorldPosition(d.pos);
    d.mesh.userData.audio.position.copy(d.pos);
    d.mesh.userData.audio.setBuffer(d.buffer);
    d.mesh.userData.audio.setLoop(d.loop);
    if (d.volume)
        try {
            d.mesh.userData.audio.setVolume(d.volume > 1 ? 1 : d.volume < 0 ? 0 : d.volume);
        } catch (err) {}
    d.mesh.userData.audio.setRefDistance(14);
    d.mesh.userData.audio.pause();
    d.mesh.userData.audio.play();
    scene.add(d.mesh.userData.audio);
},
snapRender = () => {
    if (!magnify.snap) {
        magnify.snap = "restore";
        controls.autoRotate = !1;
        renderer.setPixelRatio((window.devicePixelRatio * magnify.ratio) / magnify.pixelate);
        renderer.render(scene, camera);
        if (_pm.mobile) {
            document.getElementById("magnify-lens").style.transform = `scale('${magnify.scale}')`;
            document.getElementById("magnify-lens").style.backgroundImage = `url('${renderer.domElement.toDataURL("image/jpg")}')`;
            register.animated.visible = 60;
        } else
            renderer.domElement.toBlob((blob) => {
                document.getElementById("magnify-lens").style.transform = `scale('${magnify.scale}')`;
                document.getElementById("magnify-lens").style.backgroundImage = `url('` + URL.createObjectURL(blob) + `')`;
                register.animated.visible = 60;
            });
    }
    if (document.getElementById("magnify-lens").style.backgroundImage != "") {
        magnify.grow = !0;
        delete magnify.hide;
    }
},
resetLensSnap = () => {
    if (magnify.snap == "restored") {
        magnify.snap = "restoring";
        setTimeout(() => {
            if (magnify.snap == "restoring") delete magnify.snap;
        }, 1200);
    }
},
moveLensAperture = (event) => {
    magnify.lens = event ? { x: event.clientX, y: event.clientY } : magnify.lens;
    if (document.getElementById("magnify-lens-cont").style.display == "flex") {
        document.getElementById("magnify-lens-cont").style.left = `${magnify.lens.x - renderer.domElement.getBoundingClientRect().left - magnify.diameter / 2}px`;
        document.getElementById("magnify-lens-cont").style.top = `${magnify.lens.y - renderer.domElement.getBoundingClientRect().top - magnify.diameter / 2}px`;
        document.getElementById("magnify-lens").style.left = `${-((magnify.lens.x - renderer.domElement.getBoundingClientRect().left) * magnify.scale - magnify.diameter / 2)}px`;
        document.getElementById("magnify-lens").style.top = `${-((magnify.lens.y - renderer.domElement.getBoundingClientRect().top) * magnify.scale - magnify.diameter / 2)}px`;
    }
},
growLens = (d) => {
    if (_pm.p.camera.magnify && _pm.p.camera.magnify.glass) {
        document.getElementById("magnify-lens-frame").style.width = document.getElementById("magnify-lens-frame").style.height = `${magnify.diameter}px`;
        if (magnify.grow && (magnify.mobile || !magnify.disabled)) {
            if (magnify.max > magnify.diameter) {
                if (magnify.lens) document.getElementById("magnify-lens-cont").style.display = "flex";
                magnify.diameter += 7;
                setCursor(!1);
                moveLensAperture();
            }
        } else {
            if (magnify.min > magnify.diameter) {
                setCursor(!0);
                document.getElementById("magnify-lens-cont").style.display = "none";
                magnify.grow = null;
            } else {
                magnify.diameter -= magnify.disabled ? 27 : 9;
                moveLensAperture();
            }
        }
    }
},
setThreeCanvas = () => {
    renderer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight);
    camera.aspect = renderer.domElement.clientWidth / renderer.domElement.clientHeight;
    document.getElementById("magnify-lens").style.width = `${renderer.domElement.clientWidth * magnify.scale}px`;
    document.getElementById("magnify-lens").style.height = `${renderer.domElement.clientHeight * magnify.scale}px`;
    camera.updateProjectionMatrix();
    delete magnify.snap;
    delete magnify.grow;
},
setCursor = (c) => {
    if (magnify.cursor != c) {
        magnify.cursor = c;
        _pm.screen.style.cursor = c ? (!magnify.enabled ? "default" : `url(` + _pm.public + `assets/images/` + (magnify.disabled ? "orbit" : "magnify") + `.webp) ` + (magnify.disabled ? "21 21" : "13 13") + `, crosshair`) : "none";
        if (magnify.lens) {
            if (!c) {
                setTimeout(() => {
                    document.getElementById("magnify-lens-handle").style.display = "flex";
                }, 120);
            } else document.getElementById("magnify-lens-handle").style.display = "none";
            document.getElementById("magnify-lens-handle").style.right = c ? "-3px" : "0px";
            document.getElementById("magnify-lens-handle").style.bottom = c ? "-3px" : "0px";
        }
    }
};
window.updateCameraPosition = (d) => {
    if (register.focus) {
        if (register.invideos && !register.invideos.loaded) {
            for (let key in register.invideos.data) {
                let j = _pm.billboards.playTextureVideos({
                    id: register.invideos.data[key].id,
                    m: register.invideos.data[key].material,
                    x: register.invideos.data[key].flipX,
                    y: register.invideos.data[key].flipY,
                    intensity: .86,
                    noLoad: register.invideos.data[key].noLoad,
                });
                if (j.video) register.invideos.data[key].material.userData.noplay = j.video;
                if (j.e)
                    register.invideos.e[key] = j.e.id;
            }
            register.invideos.loaded = !0;
            setTimeout(() => {
                if (register.animated) isAnimatedVisible({ animated: register.animated.models, find: _pm.p.dynamic.videoTextures });
            }, 214);
        }
    }
    if (!_pm.p.avatar) {
        if (register.focus) {
            if (register.views) {
                if (!register.views.paused && register.loaded) {
                    if (!register.views.show && register.views.positions.sequence && register.views.positions.sequence[loader.pIndex]) {
                        register.views.show = !0;
                        if (!register.views.completed) {
                            if (register.views.counter <= 0) {
                                register.views.counter = register.views.duration;
                                register.views.index++;
                                if (register.views.info.modals[loader.pIndex][register.views.index] && _pm.p.autoPlay) {
                                    window.parent.postMessage({ code: codeString, action: "show-item", objects: JSON.stringify(register.views.info.modals[loader.pIndex][register.views.index]) }, "*");
                                }
                                if (register.views.index >= register.views.positions.sequence[loader.pIndex].length) {
                                    register.views.completed = !0;
                                    register.views.index = register.views.counter = 0;
                                    register.views.positions.sequence[loader.pIndex] = getViewsSettings().positions.idle[loader.pIndex];
                                    if (_pm.p.autoPlay) window.parent.postMessage({ code: codeString, action: "show-play-button" }, "*");
                                    skipAutoPlay(!1, !0);
                                }
                            } else register.views.counter--;
                            camera.position.lerp(register.views.positions.sequence[loader.pIndex][register.views.index], _pm.p.camera.lerp);
                        } else if (!register.clicked) {
                            if (register.views.counter <= 0) {
                                register.views.counter = register.views.delay;
                                register.views.index++;
                                if (register.views.index >= register.views.positions.sequence[loader.pIndex].length) register.views.index = 0;
                            } else register.views.counter--;
                            camera.position.lerp(register.views.positions.sequence[loader.pIndex][register.views.index], _pm.p.camera.lerp);
                        }
                        delete register.views.show;
                    }
                }
            }
        }
    }
};
window.externalTransform = (d) => {
    _pm.tracking = _pm.tracking || { coordinates: {}, positions: {}, anchors: {}, object: {} };
    if (d.type == "dot") {
        if (_pm.p.external.dragging) {
            d.p = _pm.math.screenToWorld({ x: d.position.x, y: d.position.y });
            d.m = scene.getObjectByName(_pm.p.models[_pm.p.mIndex.selected].name);
            if (d.p && d.m) {
                if (!_pm.tracking.object[d.id]) {
                    _pm.tracking.object[d.id] = d.mesh = new THREE.Mesh(new THREE.SphereGeometry(0.005, 8, 4), new THREE.MeshBasicMaterial({ color: d.id.match(/(wrist)/) ? 0xff0000 : d.id.match(/(middle)/) ? 0x00ff00 : 0x0000ff }));
                    scene.add(d.mesh);
                }
                _pm.tracking.object[d.id].position.copy(d.p);
                if (d.action.match(/(dragging)/) && _pm.p.external.dragging.anchors.includes(d.id)) {
                    _pm.tracking.origin = _pm.tracking.origin || d.id;
                    d.m.position.lerp(_pm.tracking.object[d.id].position, .86);
                    register.animation.update = !0;
                }
                if (d.action.match(/(dropped)/)) {
                    d.sp = scene.getObjectByName(`spr-${d.id}`);
                    if (d.sp) {
                        if (_pm.p.external.filter.includes(d.id)) {
                            _pm.tracking.anchors[d.id] = d.sp.position;
                        }
                        if (_pm.p.external.dragging.levers.includes(d.id)) {
                            d.a1 = _pm.math.angleOf({ v1: _pm.tracking.anchors[_pm.tracking.origin], v2: _pm.tracking.anchors[d.id] });
                            d.a2 = _pm.math.angleOf({ v1: _pm.tracking.object[_pm.tracking.origin].position, v2: _pm.tracking.object[d.id].position });
                            d.a3 = { x: d.a2.x - d.a1.x, y: d.a2.y - d.a1.y, z: d.a2.z - d.a1.z };
                            d.m.rotation.z = (d.a3.z * Math.PI) / 180;
                        }
                        register.animation.update = !0;
                    }
                }
            }
        }
    }
    if (d.type == "hand") {
        if (d.action.match(/(tracking)/)) {
            d.sm = _pm.p.models[_pm.p.mIndex.selected];
            d.m = scene.getObjectByName(d.sm.name);
            if (!d.halt) {
                d.m.visible = !0;
                for (let k in d.positions) {
                    if (_pm.p.external.filter.includes(k)) {
                        _pm.tracking.positions[k] = d.positions[k];
                        d.i = -1;
                        for (let i = 0; i < d.coordinates.hand.length; i++) if (d.coordinates.hand[i].name == k) d.i = i;
                        for (let i = 0; i < d.coordinates.pose.length; i++) if (d.coordinates.pose[i].name == k) d.i = i;
                        if (d.i > -1)
                            if (d.coordinates.hand[d.i]) {
                                _pm.tracking.coordinates[k] = new THREE.Vector3(d.coordinates.hand[d.i].x, -d.coordinates.hand[d.i].y, -d.coordinates.hand[d.i].z);
                            } else _pm.tracking.coordinates[k] = new THREE.Vector3(d.coordinates.pose[d.i].x, -d.coordinates.pose[d.i].y, -d.coordinates.pose[d.i].z);
                        if (!_pm.tracking.object[k]) {
                            _pm.tracking.object[k] = d.mesh = new THREE.Mesh(
                                new THREE.SphereGeometry(0.015, 8, 4),
                                new THREE.MeshBasicMaterial({ color: k.match(/(wrist)/) ? 0xff0000 : k.match(/(middle)/) ? 0x00ff00 : k.match(/(pinky)/) ? 0x0000ff : 0xffff00 })
                            );
                            d.mesh.name = k;
                            if (!_pm.p.external.dragging.hide) scene.add(d.mesh);
                        }
                        _pm.tracking.object[k].visible = !0;
                        _pm.tracking.object[k].position.copy(_pm.math.screenToWorld({ x: d.positions[k].x, y: d.positions[k].y }));
                        if (d.origin && _pm.tracking.coordinates[k]) {
                            d.aScl =
                                Math.sqrt(Math.pow(_pm.tracking.object[d.origin].position.x - _pm.tracking.object[k].position.x, 2) + Math.pow(_pm.tracking.object[d.origin].position.y - _pm.tracking.object[k].position.y, 2)) /
                                Math.sqrt(Math.pow(_pm.tracking.coordinates[d.origin].x - _pm.tracking.coordinates[k].x, 2) + Math.pow(_pm.tracking.coordinates[d.origin].y - _pm.tracking.coordinates[k].y, 2));
                            _pm.tracking.object[k].position.z = (_pm.tracking.coordinates[k].z - _pm.tracking.coordinates[d.origin].z) * d.aScl;
                        }
                        if (_pm.p.external.dragging.anchors.includes(k) && _pm.tracking.coordinates[k]) {
                            d.origin = d.origin || k;
                            d.offset = d.offset || new THREE.Vector3(
                                      _pm.tracking.object[k].position.x - _pm.tracking.coordinates[k].x,
                                      _pm.tracking.object[k].position.y - _pm.tracking.coordinates[k].y,
                                      _pm.tracking.object[k].position.z - _pm.tracking.coordinates[k].z
                                  );
                            d.m.position.lerp(_pm.tracking.object[k].position, .86);
                        }
                        d.sp = scene.getObjectByName(`mkr-${k}`);
                        if (d.sp) {
                            _pm.tracking.anchors[k] = d.sp.position;
                            if (_pm.p.external.dragging.levers.includes(k)) {
                                if (k.match(/(middle|elbow)/)) {
                                    d.a1 = _pm.math.angleOf({ v1: _pm.tracking.anchors[d.origin], v2: _pm.tracking.anchors[k] });
                                    d.a2 = _pm.math.angleOf({ v1: _pm.tracking.object[d.origin].position, v2: _pm.tracking.object[k].position });
                                    d.a3 = d.a3 || {};
                                    d.a3[k] = { x: d.a2.x - d.a1.x, y: d.a2.y - d.a1.y, z: d.a2.z - d.a1.z };
                                }
                            }
                            if (!k.match(/(elbow)/)) {
                                d.sc = _pm.tracking.object[d.origin].position.distanceTo(_pm.tracking.object[k].position) / _pm.tracking.anchors[d.origin].distanceTo(_pm.tracking.anchors[k]);
                                d.scale = !d.scale ? d.sc : (d.scale + d.sc) / 2;
                            }
                        }
                    }
                }
                if (_pm.tracking.hand != d.hand) {
                    _pm.tracking.hand = d.hand;
                    d.sg = d.sm.shifting[d.hand.toLowerCase()];
                    if (d.sg)
                        for (let key in d.sg) {
                            d.so = scene.getObjectByName(key);
                            if (d.so) d.so.position.copy(d.sg[key]);
                        }
                }
                d.obj = new THREE.Object3D();
                d.ro = _pm.math.getTriAngleRotation({ t1: _pm.tracking.anchors, t2: _pm.tracking.coordinates });
                d.oxx = d.ox = ((d.ro.x - (d.hand == "Left" ? 180 : 180)) * Math.PI) / 180;
                d.obj.rotation.set(
                    d.ox,
                    ((d.hand == "Left" ? -1 : -1) * d.ro.y * Math.PI) / 180,
                    (d.oz = ((d.a3.left_elbow !== undefined ? d.a3.left_elbow.z : d.a3.right_elbow !== undefined ? d.a3.right_elbow.z : d.a3.middle_finger_mcp.z) * Math.PI) / 180)
                );
                d.m.quaternion.slerp(d.obj.quaternion, .42);
                _pm.math.rotateOnAxisAngle({
                    t: _pm.tracking.anchors,
                    h: d.hand,
                    mesh: d.m,
                    a: _pm.math.findTrackingAnchorAngle({ t: _pm.tracking.coordinates }).toFixed(0) - (d.sm.adjust && d.sm.adjust[_pm.mobile ? "mobile" : "desktop"].rotation ? d.sm.adjust[_pm.mobile ? "mobile" : "desktop"].rotation : 0),
                });
                for (let i = 0, j = ["x", "y", "z"]; i < j.length; i++) if (d[`o${j[i]}`]) d.m.rotation[j[i]] = d[`o${j[i]}`];
                d.wa = normalAngle({ a: (d.oxx * 180) / Math.PI });
                if (d.wa > (_pm.mobile ? 310 : 264) || d.wa < (_pm.mobile ? 24 : 42)) {
                    if (d.sm.dynamic) {
                        if (d.sm.dynamic.scale) {
                            d.sc = d.sm.dynamic.scale[_pm.mobile ? "mobile" : "desktop"][d.a3.left_elbow || d.a3.right_elbow ? "elbow" : "noElbow"][_pm.orientation ? "landscape" : "portrait"];
                            d.m.visible = d.sc.x * d.sm.dynamic.tolerance[_pm.mobile ? "mobile" : "desktop"].near > d.scale && d.sc.x / d.sm.dynamic.tolerance[_pm.mobile ? "mobile" : "desktop"].far < d.scale;
                            if (!d.m.visible) {
                                if (_pm.tracking.misAligned != d.sc.x / d.sm.dynamic.tolerance[_pm.mobile ? "mobile" : "desktop"].far < d.scale) {
                                    _pm.tracking.misAligned = d.sc.x / d.sm.dynamic.tolerance[_pm.mobile ? "mobile" : "desktop"].far < d.scale;
                                    window.parent.postMessage({ code: codeString, action: "mis-aligned", isNear: _pm.tracking.misAligned }, "*");
                                }
                            } else if (_pm.tracking.misAligned !== undefined) {
                                delete _pm.tracking.misAligned;
                                window.parent.postMessage({ code: codeString, action: "re-aligned" }, "*");
                            }
                            d.scale = (d.sc.x + d.scale) / 2;
                        }
                    }
                    d.scale *=
                        d.sm.scale && d.sm.scale.offset
                            ? d.sm.scale.offset
                            : d.sm.dynamic.scale[_pm.mobile ? "mobile" : "desktop"][d.a3.left_elbow || d.a3.right_elbow ? "elbow" : "noElbow"][_pm.orientation ? "landscape" : "portrait"].offset;
                    d.m.scale.lerp({ x: d.scale, y: d.scale, z: d.scale }, .86);
                } else {
                    d.m.visible = !1;
                    if (_pm.tracking.misAligned === undefined) {
                        _pm.tracking.misAligned = !0;
                        window.parent.postMessage({ code: codeString, action: "mis-aligned", twisted: !0 }, "*");
                    }
                }
            } else {
                d.m.visible = !1;
                for (let i = 0, j = _pm.p.external.filter, k; i < j.length; i++) {
                    k = scene.getObjectByName(j[i]);
                    if (k) k.visible = !1;
                }
            }
            register.animation.update = !0;
        }
    }
};
window.normalAngle = (d) => {
    return d.a < 0 ? d.a + 360 : d.a > 360 ? d.a - 360 : d.a;
};
window.externalClicked = (d) => {
    if (d.type == "pane") {
        _pm.p.external.filter = _pm.p.external.filter.filter((s) => !d.filter.remove.includes(s));
        _pm.p.external.filter = _pm.p.external.filter.concat(d.filter.add);
        register.animated.visible = 120;
        window.parent.postMessage({ code: codeString, action: "hide-markers", filter: _pm.p.external && _pm.p.external.filter ? _pm.p.external.filter : undefined }, "*");
        if (register.animated && register.animated.sprites) {
            register.animated.sprites.preview = !0;
        } else register.animated.sprites = { preview: !0 };
    }
    if (d.type == "dot") {
        if (_pm.p.external) {
            if (_pm.p.external.material) {
                _pm.model.setModelMaterial({
                    model: _pm.p.external.material[d.name].model,
                    name: _pm.p.external.material[d.name].target,
                    mapName: _pm.p.external.material[d.name].mapName,
                    value: _pm.p.external.material[d.name].rgb || _pm.p.external.material[d.name].hex,
                    texture: _pm.p.external.material[d.name].texture,
                    scaleName: _pm.p.external.material[d.name].scaleName,
                    scale: _pm.p.external.material[d.name].scale,
                });
            }
            if (_pm.p.external.views && _pm.p.external.views[d.name] !== undefined) {
                register.events.switchView = { name: d.name, index: _pm.p.external.views[d.name], positions: getViewsSettings().positions.sequence[loader.pIndex], duration: 60 * 2.8, hasPane: d.hasPane };
                register.animated.visible = 120;
                window.parent.postMessage({ code: codeString, action: "hide-markers", filter: _pm.p.external && _pm.p.external.filter ? _pm.p.external.filter : undefined }, "*");
            }
            if (_pm.p.external.animations && _pm.p.external.animations[d.name]) {
                for (let i = 0; i < _pm.p.external.animations[d.name].length; i++) {
                    _pm.model.playMeshAnimation({ parent: _pm.p.external.animations[d.name][i].model, target: _pm.p.external.animations[d.name][i].target, config: _pm.p.external.animations[d.name][i], panes: { name: d.name, i: i } });
                    staticPanes({ n: d.name, i: i, hide: !0 });
                }
            }
            if (_pm.p.external.operations) {
                if (_pm.p.external.operations.type.match(/(show-buttons)/)) {
                    for (let i = 0; i < _pm.p.external.operations.buttons.length; i++)
                        document.getElementById(_pm.p.external.operations.buttons[i]).style.display = "flex";
                    document.getElementById(_pm.p.external.operations.buttons[2]).getElementsByTagName("img")[0].src = `assets/images/${d.name}.webp`;
                    register.avatar.selected = d.name;
                }
                if (_pm.p.external.operations[d.name]) {
                }
            }
        }
    }
};
window.staticPanes = (d) => {
    if (
        _pm.p.external.animations[d.n] &&
        _pm.p.external.animations[d.n][d.i].operations &&
        _pm.p.external.animations[d.n][d.i].operations.panes &&
        (_pm.p.external.animations[d.n][d.i].operations.panes.show || _pm.p.external.animations[d.n][d.i].operations.panes.hide)
    )
        window.parent.postMessage({ code: codeString, action: `static-panes${d.hide ? "-hide" : ""}`, panes: _pm.p.external.animations[d.n][d.i].operations.panes }, "*");
};
window.stopSwitchView = () => {
    if (register.events && register.events.switchView) {
        delete register.events.switchView;
        window.parent.postMessage({ code: codeString, action: "hide-markers-panels", filter: _pm.p.external && _pm.p.external.filter ? _pm.p.external.filter : undefined }, "*");
    }
};
window.getIndicatorPositions = (d) => {
    if (_pm.p.external) {
        if (!register.message && register.loaded && register.focus && register.indicators) {
            register.message = [];
            for (let i = 0, p, j; i < register.indicators.length; i++) {
                j = register.indicators[i].name.replace("spr-", "").split("-")[0];
                if (
                    (register.animated && register.animated.sprites && register.animated.sprites.preview) ||
                    !(register.events && register.events.switchView) ||
                    (register.events.switchView &&
                        (register.indicators[i].name.includes(register.events.switchView.name) ||
                            (!register.events.switchView.hasPane &&
                                _pm.p.external.icons &&
                                _pm.p.external.icons[j] &&
                                _pm.p.external.icons[j].tooltip)))
                ) {
                    if (_pm.p.external.filter.some((txt) => register.indicators[i].name.includes(txt))) {
                        d.p = new THREE.Vector3();
                        register.indicators[i].getWorldPosition(d.p);
                        if (!_pm.p.external.proximity || (_pm.p.external.proximity && isPositionInView({ p: d.p }) && camera.position.distanceTo(d.p) < _pm.p.external.proximity[j])) {
                            p = toScreenPosition({ i: i });
                            if (p)
                                register.message.push({
                                    name: register.indicators[i].name,
                                    position: { x: p.x.toFixed(0), y: p.y.toFixed(0) },
                                    completed: register.views.completed,
                                    clicked: register.clicked,
                                    proximity: p.proximity,
                                    inrange: p.inrange,
                                    hidden: p.hidden
                                });
                        }
                    }
                }
            }
            if (Object.keys(register.message).length > 0)
                window.parent.postMessage({
                    code: codeString,
                    action: "point-positions",
                    single: register.events && register.events.switchView && register.events.switchView.name ? register.events.switchView.name : undefined,
                    objects: JSON.stringify(register.message),
                    filter: _pm.p.external.filter || undefined,
                    message: _pm.p.external.message || undefined,
                    icons: _pm.p.external.icons,
                    workButtons: _pm.p.external.workButtons
                }, "*");
            else window.parent.postMessage({ code: codeString, action: "hide-markers", filter: _pm.p.external && _pm.p.external.filter ? _pm.p.external.filter : undefined }, "*");
            delete register.message;
        }
        if (register.events && register.events.switchView && register.events.switchView.duration > 0 && register.events.switchView.positions) {
            camera.position.lerp(register.events.switchView.positions[register.events.switchView.index], .096);
            register.events.switchView.duration--;
        } else if (register.animated && register.animated.sprites) delete register.animated.sprites.preview;
    }
};
window.skipAutoPlay = (c, nb) => {
    if (_pm.p.buttons)
        setTimeout(
            () => {
                for (let id in _pm.p.buttons) {
                    let j = document.getElementById(id);
                    if (j) j.style.display = c ? "none" : "flex";
                }
            },
            c ? 120 : 1800
        );
    if (c && !nb) {
        showCenterIcon({ display: "none", lock: !0 });
        delete register.clicked;
        delete register.views;
        register.views = getViewsSettings(!0);
    } else {
        glowSelectedParts();
        register.views.index = register.views.positions.sequence[loader.pIndex].length - 1;
    }
};
window.glowSelectedParts = (c) => {
    if (_pm.p.autoPlay) {
        if (restoreMat) for (let key in restoreMat) restoreMat[key].mesh.material = restoreMat[key].material;
        restoreMat = {};
        if (c && _pm.p.mIndex) {
            scene.getObjectByName(_pm.p.models[_pm.p.mIndex.selected].name).traverse((child) => {
                if (child.isMesh) {
                    for (let i = 0; i < register.views.info.modals[loader.pIndex][register.views.index].length; i++) {
                        if (child.name.includes(`sp-${register.views.info.modals[loader.pIndex][register.views.index][i]}`)) {
                            if (child.material) {
                                restoreMat[child.name] = { mesh: child, material: child.material };
                                child.material = child.material.clone();
                                child.material.emissive.r = i == 0 ? .3 : .5;
                                child.material.emissive.g = .4;
                                child.material.emissive.b = i == 1 ? .3 : .5;
                                child.material.emissiveIntensity = 1;
                            }
                        }
                    }
                }
            });
        }
    }
};
window.showCenterIcon = (d) => {
    setTimeout(
        () => {
            d.e = document.getElementById("loading-icon");
            if (d.e) {
                if (d.image !== undefined) d.e.getElementsByTagName("img")[0].src = _pm.public + `assets/images/${d.image}`;
                if (d.height !== undefined) d.e.getElementsByTagName("img")[0].style.height = d.height;
                if (d.opacity !== undefined) d.e.getElementsByTagName("img")[0].style.opacity = d.opacity;
                if (d.lock !== undefined) _pm.screen.style.pointerEvents = d.lock ? "none" : "auto";
                if (d.display && d.display.match(/(none|block|flex)/)) d.e.style.display = d.display;
                if ((d.fade && parseInt(d.fade) > 0) || (d.unfade && parseInt(d.unfade) > 0)) _pm.decam[`${d.fade ? "" : "un"}fade`](document.getElementById("loading-icon"), d.fade ? parseInt(d.fade) : parseInt(d.unfade));
                d.e.getElementsByTagName("div")[0].getElementsByTagName("span")[0].innerHTML = d.text || "";
                d.e.getElementsByTagName("div")[0].style.display = d.text ? "block" : "none";
                if (d.color) d.e.getElementsByTagName("div")[0].style.color = d.color;
            }
        },
        d && d.delay && parseInt(d.delay) > 0 ? parseInt(d.delay) + 1 : 1
    );
};
window.zoomIn = (zIn) => {
    if (!_pm.originZoom) _pm.originZoom = camera.zoom;
    camera.zoom = camera.zoom + (zIn ? (camera.zoom < 4.2 ? .1 : 0) : camera.zoom > .9 ? -0.1 : 0);
    camera.updateProjectionMatrix();
    register.animation.update = !0;
};
window.magnifyView = () => {
    document.getElementById("magnify-icon").getElementsByTagName("img")[0].src = magnify.enabled ? "assets/images/magnify.webp" : "assets/images/nomagnify.webp";
    zoomOnScreen(!0);
    setThreeCanvas({});
    if (!magnify.enabled) {
        magnify.enabled = !0;
    } else delete magnify.enabled;
    if (_pm.mobile) controls.enabled = !magnify.enabled;
};
window.loadProgram = async (d) => {
    if (_pm.p.stats && !stats) {
        stats = new Stats();
        stats.domElement.style.transformOrigin = "top left";
        stats.domElement.style.top = `${ _pm.mobile ? "69" : "72" }px`;
        stats.domElement.style.left = "50%";
        stats.domElement.style.transform = "translate(-50%)";        
        stats.domElement.style.scale = _pm.mobile ? 1.2: 1.6;
        document.body.appendChild(stats.domElement);
    } else stats = null;
    if (_pm.p.camera) {
        register.views = getViewsSettings();
        if (_pm.mobile) register.focus = !0;
        if (_pm.p.camera.type == "orbit-model") _pm.environment.setCamera({ position: register.views.positions.sequence[loader.pIndex] ? register.views.positions.sequence[loader.pIndex][0] : null, target: _pm.p.camera.target });
        if (_pm.p.camera.type == "camera-center") {
            _pm.environment.setCamera({ position: _pm.p.tours[_pm.p.tIndex].position, target: _pm.p.camera.target });
            showCenterIcon({ image: "swipe-screen-black.gif", height: "64px", opacity: .64, unfade: 600 });
        }
        document.getElementById("three-view-buttons").style.display = _pm.p.camera.magnify && _pm.p.camera.magnify.visible ? "flex" : "none";
        if (_pm.p.camera.magnify) document.getElementById("magnify-icon").style.display = _pm.p.camera.magnify.glass ? "flex" : "none";
    }
    if (_pm.p.camera.isAugmented) {
        try {
            arToolkitSource = new THREEx.ArToolkitSource({ sourceType: "webcam" });
            let onResizeAR = () => {
                arToolkitSource.onResize();
                arToolkitSource.copySizeTo(renderer.domElement);
                if (arToolkitContext.arController !== null) arToolkitSource.copySizeTo(arToolkitContext.arController.canvas);
            };
            arToolkitSource.init(onReady = () => {
                onResizeAR();
            });
            window.addEventListener("resize", () => {
                onResizeAR();
            });
            arToolkitContext = new THREEx.ArToolkitContext({ cameraParametersUrl: "data/camera_para.dat", detectionMode: "mono" });
            arToolkitContext.init(onCompleted = () => {
                camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
            });
            markerRoot1 = new THREE.Group();
            scene.add(markerRoot1);
            let markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, { type: "pattern", patternUrl: "data/dot.patt" });
            smoothedRoot = new THREE.Group();
            scene.add(smoothedRoot);
            smoothedControls = new THREEx.ArSmoothedControls(smoothedRoot, { lerpPosition: .8, lerpQuaternion: .8, lerpScale: 1 });
            renderer.domElement.style.position = "absolute";
            renderer.domElement.style.left = renderer.domElement.style.top = "0px";
            camera.scale.set(10, 10, 10);
        } catch (error) {}
    }
    if (_pm.p.gSkybox) groudedSkybox();
    if (_pm.p.tours) tour360();
    if (_pm.p.cubeBox) cubeBox();
    if (_pm.p.sprites || _pm.p.markers) {
        for (let i = 0, j = ["markers", "sprites"]; i < j.length; i++)
            if (_pm.p[j[i]]) {
                if (!_pm.p[`${j[i]}Data`]) _pm.p[`${j[i]}Data`] = { materials: [] };
                for (let k = 0; k < _pm.p[j[i]].length; k++) _pm.billboards.loadGif({ i: k, typ: [j[i]] });
            }
        loadSpriteMaterials();
    }
    if (_pm.p.behaviours) loadBehaviours({});
    _ux.createWorker({ name: "phyWorker", callback: (d) => _pm.model.loadWorker({}) });
    if (_pm.p.physics) {
        if (!register.physics)
            _ux.createWorker({ name: "aiPhysics", callback: (d) => _pm.physics.loadPhysics(Object.assign(d, { x: _pm.p.physics, p: _pm.p })) });
        if (_pm.p.avatar) {
            _pm.p.avatar.update.distance = _pm.p.avatar.update.walk;
            _pm.p.avatar.isAvatarOrVehicle = {};
            d.sz = (_pm.p.avatar.miniMap = { size: _pm.p.avatar?.miniMap?.size || 2.4 }).size;
            _pm.p.avatar.miniCam = new THREE.OrthographicCamera(-d.sz, d.sz, d.sz, -d.sz, .1, d.sz * 2);
            _pm.p.avatar.miniCam.rotation.order = 'YXZ';
            _pm.p.avatar.pos = new THREE.Vector3();
        }
    } else if (_pm.p.models) for (let i in _pm.p.models) if (_pm.p.models[i].preloaded) loadModel({ index: i });
    if (_pm.p.buttons)
        for (let id in _pm.p.buttons)
            if (document.getElementById(id) == null) {
                if (register.lastTour)
                    register.lastTour.buttons.push(id);
                createButton({ id: id, e: _pm.p.buttons[id] });
            } else document.getElementById(id).style.display = "flex";
};
window.createSpriteMesh = (i, typ) => {
    if (!_pm.useWebGPU || _pm.p[typ][i].image.name.match(/(.gif)/gi)) {
        if (_pm.p[`${typ}Data`].materials[_pm.p[typ][i].image.name] && _pm.p[`${typ}Data`].materials[_pm.p[typ][i].image.name] != "empty") {
            let mesh =
                typ == "sprites"
                    ? new THREE.Sprite(_pm.p[`${typ}Data`].materials[_pm.p[typ][i].image.name])
                    : new THREE.Mesh(new THREE.PlaneGeometry(_pm.p[typ][i].image.size.length, _pm.p[typ][i].image.size.height), _pm.p[`${typ}Data`].materials[_pm.p[typ][i].image.name]);
            mesh.material.side = _pm.p[typ][i].image.backface ? THREE.DoubleSide : mesh.material.side;
            if (_pm.p[typ][i].position) mesh.position.set(_pm.p[typ][i].position.x, _pm.p[typ][i].position.y, _pm.p[typ][i].position.z);
            if (_pm.p[typ][i].rotation) mesh.rotation.set(THREE.MathUtils.degToRad(_pm.p[typ][i].rotation.x - 90), THREE.MathUtils.degToRad(_pm.p[typ][i].rotation.y), THREE.MathUtils.degToRad(_pm.p[typ][i].rotation.z));
            if (_pm.p[typ][i].image.scale) mesh.scale.set(_pm.p[typ][i].image.scale.x, _pm.p[typ][i].image.scale.y, _pm.p[typ][i].image.scale.z);
            mesh.visible = _pm.p[typ][i].image.visible;
            mesh.name = _pm.p[typ][i].sName;
            if (_pm.p[typ][i].image.name.match(/(.mp4|.gif)/gi)) addAnimatedMesh(mesh.name);
            if (!_pm.p[typ][i].image.visible) {
                if (!_pm.p.hiddenSprites) _pm.p.hiddenSprites = [];
                _pm.p.hiddenSprites.push(_pm.p[typ][i].sName);
            }
            scene.add(mesh);
        } else return !0;
    }
};
window.loadSpriteMaterials = (m) => {
    for (let i = 0, j = ["markers", "sprites"], l; i < j.length; i++)
        if (_pm.p[j[i]])
            for (let k = 0; k < _pm.p[j[i]].length; k++)
                if (!_pm.p[j[i]][k].loaded) {
                    l = createSpriteMesh(k, j[i]);
                    if (!l) _pm.p[j[i]][k].loaded = !0;
                    m = l ? !0 : m;
                }
    if (m)
        setTimeout(() => {
            loadSpriteMaterials();
        }, 600);
};
window.updateTextures = (d) => {
    for (let i = 0, j = ["markers", "sprites"]; i < j.length; i++)
        if (_pm.p[`${j[i]}Data`])
            for (let key in _pm.p[`${j[i]}Data`].materials) {
                if (_pm.p[`${j[i]}Data`].materials[key].map) _pm.p[`${j[i]}Data`].materials[key].map.needsUpdate = !0;
                if (_pm.p[`${j[i]}Data`].materials[key].alphaMap) _pm.p[`${j[i]}Data`].materials[key].alphaMap.needsUpdate = !0;
            }
};
window.onLoadSkybox = (op) => {
    showSprites(op);
    if (op !== undefined) {
        _pm.decam.unfade(_pm.screen, 900);
        showCenterIcon({ display: "none" });
        lerpToTarget({ start: _pm.p.camera.touring.zoom.arriving, final: _pm.p.camera.zoom, rate: _pm.p.camera.touring.rate.arriving, zoom: !1 });
    }
};
window.cubeBox = (i) => {
    _pm.p.cIndex = i === undefined ? _pm.p.cIndex : i;
    _pm.environment.loadCubebox(_pm.p.cubeBox[_pm.p.cIndex]);
    _pm.environment.loadEnvironment(_pm.p.cubeBox[_pm.p.cIndex]);
};
window.groudedSkybox = (i) => {
    _pm.p.gIndex = i === undefined ? _pm.p.gIndex : i;
    _pm.environment.loadGSkybox(_pm.p.gSkybox[_pm.p.gIndex]);
    _pm.environment.loadEnvironment(_pm.p.gSkybox[_pm.p.gIndex]);
};
window.tour360 = (op) => {
    if (_pm.p.tours) {
        if (op !== undefined) {
            _pm.p.tIndex = op.tours;
            _pm.environment.setCamera({ position: op.retour ? op.retour.camera.position : null, target: op.retour ? op.retour.camera.target : _pm.p.tours[_pm.p.tIndex].position });
        }
        _pm.environment.loadSkybox(op, _pm.p.tours[_pm.p.tIndex]);
        _pm.environment.loadEnvironment(_pm.p.tours[_pm.p.tIndex]);
    }
};
window.removeSceneObjects = (j) => {
    for (let i = 0; i < j.length; i++)
        if (scene[j[i]]) {
            scene[j[i]].dispose();
            delete scene[j[i]];
        }
};
window.exploreModel = (op) => {
    register.switching = !0;
    showCenterIcon({ lock: !0 });
    removeSceneObjects(["background", "backgroundNode", "environmentNode"]);
    register.lastTour = { index: _pm.p.tIndex, camera: { position: camera.position.clone(), target: controls.target.clone() }, buttons: register.lastTour && register.lastTour.buttons ? register.lastTour.buttons : [], visible: [] };
    for (let i = 0; i < scene.children.length; i++)
        if (scene.children[i].name.match(/(markers-|sprites-)/))
            if (scene.children[i].visible) {
                register.lastTour.visible.push(scene.children[i].name);
                scene.children[i].visible = !1;
            }
    if (_pm.p.reinstall)
        for (let i = 0; i < _pm.p.reinstall.length; i++) {
            _pm.p.reinstall[i].mesh = scene.getObjectByName(_pm.p.reinstall[i].name);
            if (_pm.p.reinstall[i].mesh) _pm.model.disposeHierarchy(_pm.p.reinstall[i].mesh);
        }
    _pm.p = loader.program[(loader.pIndex = op.index)];
    if (_pm.p.unload) {
        for (let i = 0, j; i < _pm.p.unload.length; i++) {
            j = scene.getObjectByName(_pm.p.unload[i]);
            if (j) _pm.model.disposeHierarchy(j);
        }
    }
    loadProgram({ preloaded: (_pm.p.models[op.model].preloaded = !0) });
    _pm.p.models[(_pm.p.mIndex.selected = op.model)].preloaded = !1;
    if (_pm.p.hiddenSprites) {
        for (let i = 0, j; i < _pm.p.hiddenSprites.length; i++) {
            j = scene.getObjectByName(_pm.p.hiddenSprites[i]);
            if (j) j.visible = !0;
        }
        delete _pm.p.hiddenSprites;
    }
};
window.exploreTours = (op) => {
    if (!register.lastTour.toTour) lerpToTarget({ start: _pm.p.camera.zoom, final: _pm.p.camera.touring.zoom.exiting, rate: _pm.p.camera.touring.rate.exiting, zoom: !0 });
    if (register.lastTour) {
        delete register.indicators;
        delete register.sidePairsMaterials;
        delete register.sidePairs;
        window.parent.postMessage({ code: codeString, action: "hide-all", filter: _pm.p.external && _pm.p.external.filter ? _pm.p.external.filter : undefined }, "*");
        if (register.lastTour.buttons)
            for (let i = 0; i < register.lastTour.buttons.length; i++) {
                document.getElementById(register.lastTour.buttons[i]).remove();
                register.lastTour.buttons = deleteArray({ a: register.lastTour.buttons, i: i });
            }
    }
    setTimeout(() => {
        _pm.decam.fade(_pm.screen, 600);
        showCenterIcon({ image: "loading.webp", height: "64px", opacity: .96, display: "flex", delay: 120 });
        register.switching = !0;
        setTimeout(() => {
            if (register.lastTour && op && op.remove) {
                for (let i = 0, j; i < op.remove.length; i++) {
                    j = scene.getObjectByName(op.remove[i]);
                    if (j) {
                        if (op.remove[i].match(/(markers-|sprites-)/)) {
                            if (!_pm.p.hiddenSprites) _pm.p.hiddenSprites = [];
                            _pm.p.hiddenSprites.push(j.name);
                            j.visible = !1;
                        } else _pm.model.disposeHierarchy(j);
                    }
                }
                _pm.p = loader.program[(loader.pIndex = op.index)];
                register.lastTour.visible = register.lastTour.visible || [];
                if (register.lastTour.toTour) {
                    for (let i = 0; i < register.lastTour.toTour.operations.remove.length; i++)
                        register.lastTour.visible = register.lastTour.visible.filter((e) => e.includes(register.lastTour.toTour.operations[register.lastTour.toTour.index].action));
                    register.lastTour.visible = register.lastTour.visible.concat(register.lastTour.toTour.operations.include);
                }
                tour360(
                    register.lastTour.toTour
                        ? Object.assign(
                              {},
                              { toTour: { visible: register.lastTour.visible.filter((e) => !e.includes(register.lastTour.toTour.operations[register.lastTour.toTour.index].action)) } },
                              _pm.p.operations[register.lastTour.toTour.operations[register.lastTour.toTour.index].action]
                          )
                        : { tours: register.lastTour.index, retour: register.lastTour }
                );
                window.parent.postMessage({ code: codeString, action: "hide-all", filter: _pm.p.external && _pm.p.external.filter ? _pm.p.external.filter : undefined }, "*");
            } else {
                _pm.p = loader.program[(loader.pIndex = op.index)];
                loadProgram({ program: _pm.p });
            }
            if (_pm.p.reinstall)
                for (let i = 0, j; i < _pm.p.reinstall.length; i++) {
                    j = _pm.p.reinstall[i];
                    createSpriteMesh(j.index, j.type);
                    _pm.billboards.playTextureVideos({ id: _pm.p[`${j.type}Data`].materials[j.image].vID, m: j.mesh.material, x: j.flipX, y: j.flipY, intensity: .86 });
                }
        }, 600);
    }, 300);
};
window.lerpToTarget = (d) => {
    d.rate = d.rate || .5;
    if (register.lerpInterval) clearInterval(register.lerpInterval);
    register.lerpInterval = setInterval(() => {
        delete d.lerping;
        if ((d.start < d.final * .99 && !d.zoom) || (d.start > d.final * .99 && d.zoom)) {
            if (postProcessing && d.start < 1 && !d.updated) onWindowResize({ updated: (d.updated = !0) });
            d.start = (1 - d.rate) * d.start + d.rate * d.final * (d.zoom ? -1 : 1);
            d.lerping = register.animation.update = !0;
        } else clearInterval(register.lerpInterval);
        if (d.target == "maxPolarAngle") {
            controls.maxPolarAngle = d.lerping ? d.start : d.restore;
        } else {
            camera.zoom = d.lerping ? d.start : d.final;
            camera.updateProjectionMatrix();
        }
    }, 10);
};
window.createButton = (d) => {
    if (d.e) {
        d.d = document.createElement("div");
        d.d.innerHTML = `
            <span onclick="${d.e.operations}"
                ontouchstart="this.getElementsByTagName('img')[0].style.boxShadow='rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgb(209, 213, 219) 0px 0px 0px 1px inset'"
                ontouchend="this.getElementsByTagName('img')[0].style.boxShadow='rgba(50, 50, 93, .25) 0px 2px 5px -1px, rgba(0, 0, 0, .3) 0px 1px 3px -1px'"
                onmouseover="this.getElementsByTagName('img')[0].style.boxShadow='rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgb(209, 213, 219) 0px 0px 0px 1px inset'"
                onmouseout="this.getElementsByTagName('img')[0].style.boxShadow='rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px'"
                onmousedown="this.getElementsByTagName('img')[0].style.boxShadow='rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px'"
                style="display: ${d.e.hidden ? "none" : "flex"}; width: 100%, height: 100%; cursor: pointer; box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px" id="${d.id}">
                <img src="${d.e.image}" style="position: absolute; ${d.e.style}; border-radius: 50%; outline: 2.4px dashed white; background: radial-gradient(#000c, #3e3f46aa); box-shadow: rgba(50, 50, 93, .25) 0px 2px 5px -1px, rgba(0, 0, 0, .3) 0px 1px 3px -1px"/>
            </span>`;
        document.body.appendChild(d.d.firstChild);
        setTimeout(() => _pm.screen.appendChild(d.d), d.e.delay ? d.e.delay * 1000 : 10);
    }
};
window.switchCameraTarget = (c) => {
    loader.gSkybox = loader.gSkybox || {};
    c.onMax = _pm.p.camera.adjust.onMax;
    if (c && c.switch) {
        if (!loader.gSkybox.dome) loader.gSkybox.dome = scene.getObjectByName("groundedSkybox");
        if (loader.gSkybox.dome) {
            if (c.onMax.texture && loader.gSkybox && !loader.gSkybox.isMap2) {
                if (!loader.gSkybox.texture) {
                    if (!loader.gSkybox.busy) {
                        loader.gSkybox.busy = !0;
                        (c.onMax.texture.name.includes("jpg") ? new THREE.TextureLoader() : new RGBELoader())
                            .setCrossOrigin("anonymous")
                            .setPath(`${_pm.public}assets/textures/equirectangular/`)
                            .load(c.onMax.texture.name, (texture) => {
                                delete loader.gSkybox.busy;
                                texture.mapping = THREE.EquirectangularReflectionMapping;
                                texture.encoding = THREE.sRGBEncoding;
                                texture.colorSpace = THREE.SRGBColorSpace;
                                loader.gSkybox.texture = { map1: loader.gSkybox.dome.material.map, map2: texture, isMap2: !0 };
                                loader.gSkybox.dome.material.map = loader.gSkybox.texture.map2;
                                texture.dispose();
                            });
                    }
                } else loader.gSkybox.dome.material.map = loader.gSkybox.texture.map2;
                loader.gSkybox.isMap2 = !0;
            }
            if (c.onMax.scale) loader.gSkybox.dome.scale.set(c.onMax.scale.x, c.onMax.scale.y, c.onMax.scale.z);
        }
        if (c.onMax.distance.min && controls.minDistance > c.onMax.distance.min) controls.minDistance = (1 - c.onMax.distance.rate * 1.0) * controls.minDistance - c.onMax.distance.rate * 1 * c.onMax.distance.min;
        if (c.onMax.distance.max && controls.maxDistance > c.onMax.distance.max) controls.maxDistance = (1 - c.onMax.distance.rate * 1.5) * controls.maxDistance - c.onMax.distance.rate * 1.5 * c.onMax.distance.max;
        if (c.onMax.target) controls.target.lerp(c.onMax.target, c.onMax.distance.rate * 3.0);
        if (c.onMax.dragRate) controls.rotateSpeed = _pm.mobile ? c.onMax.dragRate.mobile : c.onMax.dragRate.desktop;
    } else {
        if (loader.gSkybox.dome) {
            if (c.onMax.texture && loader.gSkybox.texture && loader.gSkybox && loader.gSkybox.isMap2) {
                loader.gSkybox.dome.material.map = loader.gSkybox.texture.map1;
                delete loader.gSkybox.isMap2;
            }
            if (c.onMax.scale) loader.gSkybox.dome.scale.set(1, 1, 1);
        }
        if (c.onMax.distance.min) controls.minDistance = (1 - c.onMax.distance.rate * 2.0) * controls.minDistance + c.onMax.distance.rate * 2 * _pm.p.camera.minDistance;
        if (c.onMax.distance.max) controls.maxDistance = (1 - c.onMax.distance.rate * 3.0) * controls.maxDistance + c.onMax.distance.rate * 3 * _pm.p.camera.maxDistance;
        if (c.onMax.target) {
            c.cTy = controls.target.y;
            controls.target.lerp(_pm.p.camera.target, c.onMax.distance.rate * 6.0);
            camera.position.y -= (c.cTy - controls.target.y) * c.onMax.target.rate;
        }
        if (c.onMax.dragRate) controls.rotateSpeed = _pm.mobile ? _pm.p.dragRate.mobile : _pm.p.dragRate.desktop;
    }
};
window.onWindowResize = (d) => {
    detectDevice();
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = renderer.domElement.width / renderer.domElement.height;
    camera.fov = _pm.orientation ? _pm.p.camera.fov.desktop : _pm.p.camera.fov.mobile;
    camera.updateProjectionMatrix();
    register.animation.update = !0;
    if (postProcessing)
        for (let k in postProcessing.passes)
            if (postProcessing.passes[k].material && postProcessing.passes[k].material.name.match(/(FXAAShade)/)) {
                postProcessing.passes[k].material.uniforms.resolution.value.x = 1 / (renderer.domElement.clientWidth * renderer.getPixelRatio());
                postProcessing.passes[k].material.uniforms.resolution.value.y = 1 / (renderer.domElement.clientHeight * renderer.getPixelRatio());
            }
};
window.winEvent = (event) => {
    if (event.type.match(/(resize)/)) {
        onWindowResize({});
        setThreeCanvas({});
        setCursor(!0);
    }
    if (event.type.match(/(message)/))
        try {
            if (event.data.action) {
                event.data.x = _pm.p;
                if (event.data.action == "file-dnd") {
                    event.data.e = document.querySelector('.file-dnd');
                    event.data.e.style.display = event.data.e.style.display == 'flex'? 'none' : 'flex';
                }
                if (event.data.action == "skip") skipAutoPlay();
                if (event.data.action == "play") skipAutoPlay(!0);
                if (event.data.action == "glow") glowSelectedParts(!0);
                if (event.data.action == "unglow") glowSelectedParts();
                if (event.data.action == "clicked") externalClicked(event.data);
                if (event.data.action.match(/(dragging|dropped|tracking)/)) externalTransform(event.data);
                if (event.data.action.match(/(model-material|avatar-material)/)) {
                    if (event.data.action.match(/(avatar-material)/))
                        _pm.p.models[_pm.p.mIndex.selected].studio.colors.values[event.data.target[0]].index = event.data.index;
                    _pm.model.setModelMaterial({
                        model: event.data.x.models[event.data.x.mIndex.selected].name,
                        name: event.data.target,
                        mapName: event.data.mapName,
                        value: event.data.value || new THREE.Color().setHex(`0x${event.data.hex.replace(/#/g, "")}`),
                        texture: event.data.texture,
                        scaleName: event.data.scaleName,
                        scale: event.data.scale,
                    });
                }
                if (event.data.action.match(/(dom-elements)/)) showHideViewButtons(event.data);
                if (event.data.action.match(/(user-inputs)/)) {
                    if (register.physics.enabled) {
                        clearInterval(register.vehicles.brakeInterval[_pm.user.uid]);
                        delete register.user.destinations[_pm.user.uid];
                        delete register.avatar.camera.clipped;
                        delete register.user.movemarker;
                        if (event.data.inputs.longPress) {
                        }
                        if (event.data.inputs.jump) {
                            if (_pm.p.avatar.revert) {
                                event.v = _pm.p.avatar.isAvatarOrVehicle[_pm.user.uid];
                                if (new THREE.Vector3(0, 1, 0).applyQuaternion(event.v.mesh.quaternion).dot(new THREE.Vector3(0, 1, 0)) < 0)
                                    _pm.physics.revertUser({ phyID: event.v.phyID.replace(/-main/g, ""), p: _pm.p.avatar.revert.position, q: _pm.p.avatar.revert.quaternion, rs: _pm.p.avatar.revert.respawn });
                            }
                            _pm.physics.updateLocation({ action: "jump" });
                        }
                        if (event.data.inputs.keyF || event.data.inputs.keyO) {
                            showHideViewButtons({ [event.data.inputs.keyO ? "show" : "hide"]: ["three-view-buttons", "magnify-lens-cont"] });
                            if (event.data.inputs.keyO)
                                controls.maxDistance = _pm.p.camera.maxDistance || .01;
                        }
                        if (event.data.inputs.keyG || event.data.inputs.keyH) {
                            if (_pm.p.avatar)
                                saveLastLocation({ pos: new THREE.Vector3() });
                            window.parent.postMessage({ code: codeString, action: "goto-page", page: `avatar-${event.data.inputs.keyG ? "select" : "studio"}.html?${loader.pIndex}` }, '*');
                        }
                        if (!_pm.useWebGPU && (event.data.inputs.keyComma || event.data.inputs.keyDot))
                            scene.traverse((child) => {
                                if (child.isMesh) child.material.wireframe = event.data.inputs.keyComma;
                            });
                        else if (event.data.inputs.keyZ) event.data.action = "action-wave-hand";
                        if (event.data.inputs.keyL)
                            event.data.action = "avatar-location";
                        if (register.user.vehicle[_pm.user.uid] && (event.data.inputs.keyEnter || event.data.inputs.keyESC)) _pm.physics.switchDriving({ uid: _pm.user.uid, drive: event.data.inputs.keyEnter ? !0 : !1 });
                        register.user.inputs[_pm.user.uid] = event.data.inputs;
                        _pm.screen.style.cursor = event.data.inputs.keyO ? "default" : "none";
                    };
                }
                if (event.data.action.match(/(avatar-location)/))
                    window.parent.postMessage({ code: codeString, action: "player-activity", message: { type: "avatar-location", location: Object.assign({ v: _pm.model.entered || (localStorage.avatar ? JSON.parse(localStorage.avatar)[loader.pIndex].entered : undefined) }, _pm.p.avatar.revert.position, { w: THREE.MathUtils.radToDeg(_pm.physics.getYDirection({q: _pm.p.avatar.revert.quaternion}).y) }) } }, '*');
                if (event.data.action.match(/(action-)/) && register.user.uid[_pm.user.uid]) {
                    if (event.data.action.match(/(drive|walk)/)) _pm.physics.switchDriving({ uid: _pm.user.uid, drive: event.data.action.match(/(drive)/) });
                    if (event.data.action.match(/(wave-hand)/)) {
                        event.mesh = register.avatar.meshes[register.user.uid[_pm.user.uid]];
                        if (event.mesh.userData.isDriving || event.mesh.userData.isPassenger) {
                            event.aH = register.user.vehicle[_pm.user.uid].mesh.userData.sound.honk;
                            if (register.user.vehicle[_pm.user.uid].mesh.userData.audio) register.user.vehicle[_pm.user.uid].mesh.userData.audio.playbackRate = 1;
                            loadAudio({ mesh: register.user.vehicle[_pm.user.uid].mesh, audio: event.aH[Math.floor(Math.random() * event.aH.length)], loop: !1 });
                        } else {
                            event.acts = register.avatar.activities.waving;
                            _pm.model.loadAvatarAnimation({ name: event.acts[Math.floor(Math.random() * event.acts.length)], mesh: event.mesh, loop: !1, fadeIn: .42 });
                            _pm.physics.updateLocation({ action: "wave" });
                        }
                    }
                }
                if (event.data.action.match(/(switch-camera)/) && _pm.p.avatar && _pm.p.avatar.enabled == 1) {
                    register.user.targets[_pm.p.avatar.camera] = register.user.target;
                    _pm.p.avatar.camera++;
                    if (_pm.p.avatar.camera > Object.keys(register.avatar.camera.position).length - 1) _pm.p.avatar.camera = 0;
                    register.user.target = register.user.targets[_pm.p.avatar.camera] || 0;
                    setTimeout(() => {
                        controls.maxDistance = register.avatar.camera.wPos.target.distanceTo(register.avatar.camera.wPos.position);
                    }, 127);
                }
            }
        } catch (error) {}
};
window.areAnimatedVisible = (d) => {
    if (register.animated) {
        if (_pm.p.dynamic) {
            isAnimatedVisible({ animated: register.animated.models, find: _pm.p.dynamic.videoTextures });
        } else if (_pm.p.markers) {
            isAnimatedVisible({ animated: register.animated.models, find: _pm.p.markers });
        } else if (_pm.p.sprites) isAnimatedVisible({ animated: register.animated.models, find: _pm.p.sprites });
    }
    if (!_pm.model.iBusy)
        isInteriorVisible({ k: 0, b: (_pm.model.iBusy = !0) });
};
window.orbitEvent = (event) => {
    if (event.type.match(/(change)/)) {
        register.animation.update = !0;
        if (controls) register.polarAngle = THREE.MathUtils.radToDeg(controls.getPolarAngle());
        if (register.polarAngle && _pm.p.camera.adjust) switchCameraTarget({ switch: register.polarAngle >= _pm.p.camera.adjust.limit.max * .98 });
        if (register.events && register.events.orbiting) register.events.orbiting = "orbiting";
    }
    if (event.type.match(/(start)/)) {
        if (_pm.p.models)
            for (let i in _pm.p.models) {
                let j = _pm.p.models[i].interactive;
                if (register.events && register.events.mousemove) delete register.events.mousemove.hovering;
                if (j) dynamicMeshHovered({ interactive: j, type: "reset" }, i);
            }
        setTimeout(
            () => {
                areAnimatedVisible({});
            },
            _pm.mobile ? 1024 : 856
        );
        stopSwitchView();
        magnify.disabled = !0;
    }
    if (event.type.match(/(end)/)) {
        if (register.events && !register.events.orbiting) register.events.orbiting = !0;
        areAnimatedVisible({});
        delete magnify.disabled;
        delete magnify.snap;
    }
};
window.setDestinationMarker = (d) => {
    register.user.destinations[_pm.user.uid] = register.user.movemarker.point;
    if (_pm.mobile) {
        d.v = register.avatar.meshes[register.user.uid[_pm.user.uid]].userData.isDriving;
        controls.maxDistance = d.v ? 7 : 4.2;
        _pm.p.avatar.enabled = 2;
        if (!d.v) {
            window.parent.postMessage({ code: codeString, action: "user-vehicle" });
            window.parent.postMessage({ code: codeString, action: "user-buttons", target: "button-icon" });
        }
    } else window.parent.postMessage({ code: codeString, action: "window-focus" }, "*");
};
window.rendererEvent = (event) => {
    event.preventDefault();
    if (event.type.match(/(mouseup)/)) window.parent.postMessage({ code: codeString, action: "window-focus" }, "*");
    if (_pm.mobile ? event.touches && event.touches[0] && event.touches[0].clientX : event.clientX) {
        raycaster.setFromCamera(new THREE.Vector3(((_pm.mobile ? event.touches[0].clientX : event.clientX) / window.innerWidth) * 2 - 1, -((_pm.mobile ? event.touches[0].clientY : event.clientY) / window.innerHeight) * 2 + 1, .5), camera);
        if (register.avatar.level.navigation) register.avatar.intersects = raycaster.intersectObjects(register.avatar.level.navigation);
    }
    if (event.type.match(/(mousemove)/)) {
        if (event.button === 0) {
            resetLensSnap();
            setTimeout(() => {
                renderer.domElement.onmousemove = null;
            }, 9600);
        }
    }
    if (event.type.match(/(mousedown|touchstart)/)) {
        if (register.physics) controls.enableDamping = !0;
        setTimeout(() => {
            _pm.model.optimizeAssets({});
        }, 1024);
    }
    if (event.type.match(/(touchstart)/)) {
        register.touches.longpress = { duration: performance.now() };
        setTimeout(() => {
            zoomOnScreen("once");
            if (magnify.enabled) {
                snapRender();
                moveLensAperture(event.targetTouches[0]);
            }
        }, 120);
    }
    if (event.button === 1) showNavigationMarker({});
    if (event.type.match(/(mouseup|touchend)/)) {
        if (register.touches.longpress && performance.now() - register.touches.longpress.duration > 420) showNavigationMarker({});
        isLostFocus({});
    }
    if (event.type.match(/(touchmove)/) && event.targetTouches.length > 0 && magnify.mobile) moveLensAperture(event.targetTouches[0]);
    if (event.type.match(/(mousemove)/)) {
        if (!magnify.disabled && magnify.enabled) {
            if (magnify.mouse.moved > (magnify.snap ? magnify.mouse.resolution : magnify.mouse.normal)) {
                magnify.mouse.moved = 0;
            } else if (magnify.mouse.moved == 1) {
                let intersects = raycaster.intersectObjects(scene.children);
                if (!_pm.mobile) {
                    if (intersects.length > 0 && _pm.p.magnify && (_pm.p.magnify.includes(intersects[0].object.parent.name) || _pm.p.magnify.includes("*"))) {
                        snapRender();
                    } else {
                        magnify.hide = !0;
                        setTimeout(() => {
                            delete magnify.grow;
                        }, 300);
                    }
                    moveLensAperture(event);
                }
            }
            magnify.mouse.moved++;
        }
    }
    if (event.type.match(/(wheel)/)) {
        if (_pm.p.avatar && _pm.p.avatar.enabled == 1) {
            register.user.targets[_pm.p.avatar.camera] = register.user.target;
            _pm.p.avatar.camera += _pm.p.avatar.camera < Object.keys(register.avatar.camera.position).length - 1 && event.wheelDelta > 0 ? 1 : _pm.p.avatar.camera && event.wheelDelta < 0 ? -1 : 0;
            register.user.target = register.user.targets[_pm.p.avatar.camera] || 0;
        } else if (_pm.p.enableZoom && _pm.p.wheelMinDistance) {
            controls.minDistance = _pm.p.wheelMinDistance;
            hideCursorPointer({});
        }
        if (_pm.p.avatar && _pm.p.avatar.enabled)
            setTimeout(() => {
                controls.maxDistance = register.avatar.camera.wPos.target.distanceTo(register.avatar.camera.wPos.position);
            }, 127);
        resetLensSnap();
    }
    if (event.type.match(/(mousedown|wheel)/)) register.views.completed = !0;
    if (event.type.match(/(mousemove|mousedown|touchstart)/)) {
        if (event.button == 0 || _pm.mobile) {
            try {
                for (let i = 0, j = ["markers", "sprites"]; i < j.length; i++)
                    if (_pm.p[j[i]])
                        for (let k = 0, intersects, op; k < _pm.p[j[i]].length; k++) {
                            if (_pm.p[j[i]][k].sName) {
                                event.mesh = scene.getObjectByName(_pm.p[j[i]][k].sName);
                                if (event.mesh) {
                                    intersects = raycaster.intersectObject(event.mesh);
                                    if (event.type.match(/(mousemove)/) && intersects.length > 0 && intersects[0].object.name.match(/(markers-|sprites-)/) && _pm.p.operations[intersects[0].object.name]) _pm.screen.style.cursor = "pointer";
                                    if (event.type.match(/(mousedown|touchstart)/) && intersects.length > 0) {
                                        if (intersects[0].object.name.match(/(markers-|sprites-)/)) {
                                            op = _pm.p.operations[intersects[0].object.name];
                                            if (op) {
                                                if (op.name.match(/(replace-model)/)) {
                                                    delete register.indicators;
                                                    showCenterIcon({ image: "loading.webp", height: "64px", opacity: .96, display: "flex", delay: 120 });
                                                    unloadModels({ models: _pm.p.operations.unload });
                                                    event.mesh = scene.getObjectByName("mesh shadow");
                                                    if (event.mesh) _pm.model.disposeHierarchy(event.mesh);
                                                    loadModel({ index: (_pm.p.mIndex.selected = op.index) });
                                                    window.parent.postMessage({ code: codeString, action: "model-changed", name: _pm.p.models[_pm.p.mIndex.selected].name }, "*");
                                                    if (_pm.p.camera.adjust && _pm.p.camera.adjust.onMax.distance && _pm.p.camera.adjust.onMax.resetFocus)
                                                        lerpToTarget({
                                                            start: controls.maxPolarAngle,
                                                            restore: controls.maxPolarAngle,
                                                            final: THREE.MathUtils.degToRad(62),
                                                            rate: _pm.p.camera.adjust.onMax.distance.rate * .24,
                                                            zoom: !0,
                                                            target: "maxPolarAngle",
                                                        });
                                                }
                                                if (op.name.match(/(tour-360|to-tour-360|explore-model)/)) {
                                                    lerpToTarget({ start: _pm.p.camera.zoom, final: _pm.p.camera.touring.zoom.departing, rate: _pm.p.camera.touring.rate.departing, zoom: !1 });
                                                    if (op.name.match(/(to-tour-360)/)) {
                                                        register.lastTour = register.lastTour || {};
                                                        register.lastTour.toTour = { operations: _pm.p.operations, index: intersects[0].object.name };
                                                        restoreInVideos();
                                                        exploreTours(_pm.p.return);
                                                    } else {
                                                        _pm.decam.fade(_pm.screen, 600);
                                                        showCenterIcon({ image: "loading.webp", height: "64px", opacity: .96, display: "flex", delay: 120 });
                                                        setTimeout(() => {
                                                            if (op.name.match(/(explore-model)/)) {
                                                                restoreInVideos();
                                                                exploreModel(op);
                                                            } else tour360(op);
                                                        }, 600);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
            } catch (err) {}
            if (loader.program && _pm.p.models)
                for (let i in _pm.p.models) {
                    event.interactive = _pm.p.models[i].interactive;
                    if (event.interactive) {
                        event.e = scene.getObjectByName(_pm.p.models[i].name);
                        if (event.e) {
                            event.intersects = raycaster.intersectObject(scene.getObjectByName(_pm.p.models[i].name));
                            if (event.intersects.length > 0) {
                                if (event.type.match(/(mousedown|touchstart)/)) dynamicMeshClicked(event);
                                if (event.type.match(/(mousemove|touchstart)/) && _pm.p.dynamic && _pm.p.dynamic.interactive && _pm.p.dynamic.interactive.includes(event.intersects[0].object.parent.name)) dynamicMeshHovered(event, i);
                            }
                        }
                    }
                }
        }
    } else if (event.type.match(/(mouseup|wheel)/)) {}
};
window.restoreInVideos = () => {
    if (!register.inVidsRestore) {
        register.inVidsRestore = register.invideos;
        delete register.invideos;
    } else register.invideos = register.inVidsRestore;
};
window.dynamicMeshClicked = (event) => {
    event.parent = event.intersects[0].object.parent == scene ? event.intersects[0].object : event.intersects[0].object.parent;
    if (event.interactive && event.interactive.values && event.interactive.values[event.parent.name])
        if (event.interactive.operation == "replace model") {
            event.sign = scene.getObjectByName(`sign-${_pm.p.models[_pm.p.mIndex.selected].name.toLowerCase().replace(_pm.p.dynamic.replace, "")}`);
            if (event.sign) event.sign.visible = !1;
            showCenterIcon({ image: "loading.webp", height: "64px", opacity: .96, display: "flex", delay: 120 });
            unloadModels({ models: event.interactive.unload });
            loadModel({ index: (_pm.p.mIndex.selected = event.interactive.values[event.parent.name]) });
            event.sign = scene.getObjectByName(`sign-${_pm.p.models[_pm.p.mIndex.selected].name.toLowerCase().replace(_pm.p.dynamic.replace, "")}`);
            if (event.sign) event.sign.visible = !0;
            event.mesh = scene.getObjectByName("mesh shadow");
            if (event.mesh) _pm.model.disposeHierarchy(event.mesh);
            window.parent.postMessage({ code: codeString, action: "model-changed", name: _pm.p.models[_pm.p.mIndex.selected].name }, "*");
            register.views.index = register.views.positions.sequence[loader.pIndex].length - 1;
        }
};
window.dynamicMeshHovered = (event, i) => {
    if (!event.type.match(/(reset)/)) register.events[event.type] = register.events[event.type] || {};
    _pm.screen.style.cursor = "pointer";
    if (event.type.match(/(reset)/) || register.events[event.type].hovering != event.intersects[0].object.parent.name) {
        if (_pm.p.dynamic && _pm.p.dynamic.materials && !register.sidePairsMaterials) {
            register.sidePairsMaterials = {};
            register.sidePairs = _pm.p.dynamic.sidepairs;
            scene.getObjectByName(_pm.p.dynamic.model).traverse((child) => {
                for (let k = 0, l = _pm.p.dynamic.materials; k < l.length; k++)
                    if (child.material && child.material.name.includes(l[k])) register.sidePairsMaterials[child.material.name] = { emissiveIntensity: child.material.emissiveIntensity, material: child.material };
            });
        }
        if (event.type.match(/(reset)/)) event.type = "mousemove";
        if (register.events && register.events[event.type] && register.events[event.type].unhover) {
            _pm.model.playMeshAnimation({ parent: _pm.p.dynamic.model, target: [register.events[event.type].unhover], config: _pm.p.dynamic.animation.unhover });
            for (let key in register.sidePairsMaterials) register.sidePairsMaterials[key].material.emissiveIntensity = register.sidePairsMaterials[key].emissiveIntensity;
            if (_pm.p.dynamic.screens)
                for (let k = 0, l = _pm.p.dynamic.screens, m, n, o; k < l.length; k++) {
                    m = register.sidePairsMaterials[register.events[event.type].unhover + l[k]].material;
                    m.emissiveIntensity = 0;
                    n = _pm.p.models[i].interactive;
                    if (n && n.images) {
                        o = n.images[register.events[event.type].unhover];
                        if (o.status) {
                            delete o.status;
                            register.animated.visible = 60;
                            if (!o.texture2) {
                                new THREE.TextureLoader()
                                    .setCrossOrigin("anonymous")
                                    .setPath(_pm.public + n.images.path)
                                    .load(o.name.replace("active", "inactive"), (texture) => {
                                        texture.encoding = THREE.sRGBEncoding;
                                        texture.generateMipmaps = !0;
                                        texture.minFilter = THREE.LinearMipmapLinearFilter;
                                        texture.magFilter = THREE.LinearFilter;
                                        m.map = m.emissiveMap = _pm.model.wrapTexture(texture, o.flipX, o.flipY);
                                        m.map.colorSpace = THREE.SRGBColorSpace;
                                        m.map.anisotropy = m.emissiveMap.anisotropy = _pm.useWebGPU ? renderer.getMaxAnisotropy() : renderer.capabilities.getMaxAnisotropy();
                                        texture.dispose();
                                    });
                            } else m.map = m.emissiveMap = o.texture2;
                            if (o.isVideo) {
                                n = document.getElementById(register.invideos.e[register.events[event.type].unhover + _pm.p.dynamic.screens]);
                                if (n) {
                                    if (isVidPlaying({ video: n })) {
                                        n.pause();
                                        document.getElementById("in-canvas-motion-texture").removeChild((register.invideos.dom[register.invideos.e[register.events[event.type].unhover + _pm.p.dynamic.screens]] = n));
                                    }
                                }
                            }
                        }
                    }
                }
            delete register.events[event.type].unhover;
        }
        if (event.intersects) {
            register.events[event.type] = { hovering: event.intersects[0].object.parent.name, unhover: event.intersects[0].object.parent.name };
            setTimeout(() => {
                if (register.events[event.type]) {
                    if (_pm.p.dynamic.animation.hovering.onetime === undefined || _pm.p.dynamic.animation.hovering.onetime) {
                        if (_pm.p.dynamic.animation.hovering.onetime) _pm.p.dynamic.animation.hovering.onetime = !1;
                        _pm.model.playMeshAnimation({ parent: _pm.p.dynamic.model, target: [register.events[event.type].hovering], config: _pm.p.dynamic.animation.hovering });
                    }
                    if (register.sidePairsMaterials && register.sidePairs && register.sidePairs[register.events[event.type].hovering])
                        register.sidePairsMaterials[register.sidePairs[register.events[event.type].hovering][0]].material.emissiveIntensity = register.sidePairsMaterials[
                            register.sidePairs[register.events[event.type].hovering][1]
                        ].material.emissiveIntensity = register.sidePairs.intensity;
                    if (_pm.p.dynamic.screens)
                        for (let k = 0, l = _pm.p.dynamic.screens, m, n, o; k < l.length; k++)
                            if (register.sidePairsMaterials[register.events[event.type].hovering + l[k]]) {
                                m = register.sidePairsMaterials[register.events[event.type].hovering + l[k]].material;
                                n = _pm.p.models[i].interactive;
                                if (n && n.images) {
                                    o = n.images[register.events[event.type].hovering];
                                    if (!o.status) {
                                        o.status = !0;
                                        register.animated.visible = !0;
                                        m.emissiveIntensity = o.intensity;
                                        if (o.isVideo) {
                                            m.map = m.emissiveMap = register.invideos.data[register.events[event.type].hovering + _pm.p.dynamic.screens].material.userData.noplay;
                                            if (register.invideos.dom[register.invideos.e[register.events[event.type].hovering + _pm.p.dynamic.screens]])
                                                document.getElementById("in-canvas-motion-texture").appendChild(register.invideos.dom[register.invideos.e[register.events[event.type].hovering + _pm.p.dynamic.screens]]);
                                            n = document.getElementById(register.invideos.e[register.events[event.type].hovering + _pm.p.dynamic.screens]);
                                            if (n && !isVidPlaying({ video: n })) {
                                                register.animated.busy = !0;
                                                n.play();
                                            }
                                        } else if (!o.texture1) {
                                            new THREE.TextureLoader()
                                                .setCrossOrigin("anonymous")
                                                .setPath(_pm.public + n.images.path)
                                                .load(o.name, (texture) => {
                                                    texture.encoding = THREE.sRGBEncoding;
                                                    texture.generateMipmaps = !0;
                                                    texture.minFilter = THREE.LinearMipmapLinearFilter;
                                                    texture.magFilter = THREE.LinearFilter;
                                                    m.map = m.emissiveMap = _pm.model.wrapTexture(texture, o.flipX, o.flipY);
                                                    m.map.colorSpace = THREE.SRGBColorSpace;
                                                    m.map.anisotropy = m.emissiveMap.anisotropy = _pm.useWebGPU ? renderer.getMaxAnisotropy() : renderer.capabilities.getMaxAnisotropy();
                                                    texture.dispose();
                                                });
                                        } else m.map = m.emissiveMap = o.texture1;
                                    }
                                }
                            }
                }
            }, 600);
        }
    }
};
window.onMeshAnimationFinished = (event) => {};
window.toScreenPosition = (d) => {
    d.vector = new THREE.Vector3();
    d.widthHalf = .5 * window.innerWidth;
    d.heightHalf = .5 * window.innerHeight;
    register.indicators[d.i].updateMatrixWorld();
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();
    d.vector.setFromMatrixPosition(register.indicators[d.i].matrixWorld);
    d.vector.project(camera);
    raycaster.setFromCamera(d.vector, camera);
    try {
        d.intersects = raycaster.intersectObject(scene.getObjectByName("intersect"));
        return {
            x: d.vector.x * d.widthHalf + d.widthHalf,
            y: -(d.vector.y * d.heightHalf) + d.heightHalf,
            hidden: d.intersects.length > 0 && d.intersects[0].distance < d.vector.distanceTo(camera.position) - .063,
            inrange: d.vector.distanceTo(camera.position) < 3.1,
            proximity: d.vector.distanceTo(camera.position),
        };        
    } catch (error) {}
};
window.unloadModels = (d) => {
    requestIdleCallback(() => {
        d.bodies = [];
        d.restore = [];
        for (let i in d.models) {
            while (d.mesh = _pm.model.getMesh({ p: "name", k: _pm.p.models[d.models[i]].name })) {
                if (d.mesh.mIdx == d.models[i]) {
                    if (d.mesh.mxID) {
                        d.mxID = d.mesh.mxID;
                        mixers[d.mxID].stopAllAction();
                        if (typeof mixers[d.mxID].uncacheRoot === "function")
                            try {
                                THREE.AnimationMixer.uncacheRoot(d.mesh);                
                            } catch (error) {}
                        delete mixers[d.mxID];
                    }
                    if (_pm.p.models[d.models[i]].userData) {
                        delete _pm.p.models[d.models[i]].userData.loaded;
                        if (_pm.p.models[d.models[i]].userData.archive)
                            _pm.model.archived = _pm.model.archived.filter(item => !_pm.p.models[d.models[i]].userData.archive.includes(item));
                        if (_pm.p.models[d.models[i]].userData.markers && _pm.p.models[d.models[i]].userData.markers.remove)
                            window.parent.postMessage({ code: codeString, action: "remove-all-markers" }, "*");   
                    }
                    if (d.mesh.userData.meshParts)
                        for (let k in d.mesh.userData.meshParts) {
                            d.bodies.push(d.mesh.userData.meshParts[k]);
                            d.node = _pm.model.getMesh({ p: "phyID", k: k });
                            if (d.node) _pm.model.disposeHierarchy(d.node);
                        }
                    if (_pm.worker.aiPhysics) {
                        d.mesh.traverse((child) => {
                            if (child.phyID) d.bodies.push(child.phyID);
                        });
                        _pm.worker.aiPhysics.operation.postMessage({ action: "remove-bodies", bodies: d.bodies });
                    }
                    for (let i = 0, j = ["navigation", "obstacle"]; i < j.length; i++)
                        if (register.avatar.level[j[i]])
                            try {
                                for (let k in register.avatar.level[j[i]])
                                    if (register.avatar.level[j[i]][k].uuid == d.mesh.uuid) register.avatar.level[j[i]] = deleteArray({ a: register.avatar.level[j[i]], i: k });
                            } catch (error) {}
                    _pm.model.disposeHierarchy(d.mesh);
                    if (_pm.p.models[d.models[i]].phyID)
                        _pm.p.models[d.models[i]].name = _pm.p.models[d.models[i]].name.replace(`-${_pm.p.models[d.models[i]].phyID}-main`, "");
                    if (d.all)
                        for (let j in scene.children)
                            if (scene.children[j].name.match(_pm.p.models[d.models[i]].name))
                                _pm.p.models[d.models[i]].name = scene.children[j].name;
                    if (JSON.stringify(Object.keys(loader.collider.geometries)).includes(d.models[i])) {
                        d.x = [];
                        for (let j in loader.collider.remove)
                            if (loader.collider.remove[j] && loader.collider.remove[j].includes(d.models[i])) {
                                d.x.push(loader.collider.remove[j]);
                                loader.collider.remove = deleteArray({ a: loader.collider.remove, i: j });
                            }
                        if (d.x.length > 0)
                            _pm.worker.aiPhysics.operation.postMessage({
                                action: "remove-bodies",
                                bodies: d.x
                            });
                        for (let j in loader.collider.geometries)
                            if (j.includes(d.models[i]))
                                delete loader.collider.geometries[j];
                    }
                } else {
                    scene.remove(d.mesh);
                    d.restore.push(d.mesh);
                }
            }
        }
        if (d.restore.length > 0)
            for (let i in d.restore)
                scene.add(d.restore[i]);
    }, { timeout: 768 });
};
window.loadModelStarted = () => {
    window.parent.postMessage({ code: codeString, action: "show-viewer" }, "*");
};
window.loadModelCompleted = (url, loaded, total) => {
    if (loaded / total == 1) {
        if (register.switching) {
            delete register.switching;
            delete register.clicked;
            _pm.decam.unfade(_pm.screen, 600);
            lerpToTarget({ start: _pm.p.camera.touring.zoom.arriving, final: _pm.p.camera.zoom, rate: _pm.p.camera.touring.rate.arriving, zoom: !1 });
            showCenterIcon({ lock: !1 });
        } else window.parent.postMessage({ code: codeString, action: "hide-waiting" }, "*");
        register.loaded = register.animation.update = !0;
        if (_pm.p.camera.fixed || register.physics) {
            showCenterIcon({ display: "none", lock: !1, delay: register.physics ? 4096 : 1200 });
        } else if (!_pm.p.camera.type.match(/(camera-center)/)) showCenterIcon({ image: "swipe-screen.gif", height: "64px", opacity: .96 });
        if (register.physics) {
            if (register.physics.ready && !register.physics.enabled)
                setTimeout(() => {
                    _pm.worker.aiPhysics.operation.postMessage({ action: "physics-enabled", enabled: (register.physics.enabled = !0), opacity: (_pm.screen.style.opacity = 1) });
                    window.parent.postMessage({ code: codeString, action: "enable-controls" }, "*");
                    _pm.model.isInBoundaries({ b: _pm.model.boundaries, ready: !0, zn: "enter-zone" });
                    if (register.invideos)
                        delete register.invideos.loaded;
                }, 96);
                showCenterIcon({ display: "none" });
        }
        if (postProcessing) onWindowResize({});
        for (let i = 0, j = ["enter", "leave"]; i < j.length; i++)
            if (register.unload[j[i]] && register.unload[j[i]].length > 0)
                unloadModels({ models: register.unload[j[i]], reset: register.unload[j[i]] = [], all: !0 });
        register.loading = [];
        _pm.model.asyncLoading({});
        renderer.compile(scene, camera);
    }
};
window.loadModel = async (d) => {
    if (_pm.p.models[d.index].userData) {
        if (d.px = _pm.p.models[d.index].userData.proximity) {
            d.p = new THREE.Vector3().copy(d.px.offset || _pm.p.models[d.index].position);
            if (d.p.distanceTo(camera.position) > d.px.distance && (!d.px.occluded && !isPositionInView({ p: d.p }))) {
                _pm.model.archived.push(d.index);
                for (let i in d.px.impostor)
                    _pm.p.models[d.px.impostor[i]].preloaded = !0;
                return;
            }
            if (!_pm.p.models[d.index].userData.config)
                _pm.model.dynamic[d.index] = _pm.p.models[d.index].name;
        }
        if (!_pm.p.models[d.index].userData.loaded)
            _pm.p.models[d.index].userData.loaded = !0;
        else return;
    }
    loader.gltf = loader.gltf || new GLTFLoader(loader.manager)
              .setCrossOrigin("anonymous")
              .setPath(_pm.p.models[d.index].name.match("https://") ? "" : `${_pm.public}assets/models/`)
              .setDRACOLoader(new DRACOLoader().setDecoderPath(`${_pm.public}assets/js/libs/draco/`));
    if (isOnline() && !_pm.useWebGPU && !loader.useNeedle && (loader.useNeedle = !0)) {
        const { useNeedleProgressive } = await import("@needle-tools/gltf-progressive");
        useNeedleProgressive( loader.gltf, renderer );
    }
    if (_pm.p.models[d.index].name.match(/(-main)/)) {
        d.n = _pm.p.models[d.index].name.split("-");
        _pm.p.models[d.index].name = _pm.p.models[d.index].name.replace(`-${d.n[d.n.length - 2]}-${d.n[d.n.length - 1]}`, "");
    }
    if (!_pm.p.models[d.index].file)
        _pm.p.models[d.index].file = _pm.p.models[d.index].name;
    else _pm.p.models[d.index].name = _pm.p.models[d.index].file;
    loader.gltf.load(`${_pm.p.models[d.index].name.match("https://") ? _pm.p.models[d.index].name : `${_pm.p.models[d.index].name.replace(/.glb/g, "")}.glb`}`, async (gltf) => {
        if (!register.physics || register.physics && register.physics.enabled)
            requestIdleCallback(() => processGLTF(d, gltf), { timeout: 1536 });
        else processGLTF(d, gltf);
    });
};
window.processGLTF = (d, gltf) => {
    gltf.scene.traverse(async (child) => {
        if (child.name.match(/(intersect|phy-body-main|phy-body-part|phy-body-vehicle)/)) {
            child.visible = !1;
            if (child.material) { child.material.color = 0x000000; child.material.wireframe = !0 }
            if (child.name.match(/(trimesh|polyhedron)/) && child.geometry)
                _pm.physics.metis({ c: child, l: loader.collider.limit });
        } else {
            if (child.name.match("Armature"))
                d.avatar = !0;
            if (d.avatar)
                child.frustumCulled = !1;
            if (child.name) {
                for (let i = 0, j = ["hide", "show"]; i < j.length; i++)
                    if (_pm.p.models[d.index][j[i]] && _pm.p.models[d.index][j[i]].includes(child.name)) {
                        d.show = child.name;
                        child.visible = j[i].match(/(hide)/) ? !1 : !0;
                    }
                for (let i = 0, j = ["hide", "remove"]; i < j.length; i++)
                    if (!child.name.match("Armature") && child.isMesh && _pm.p.models[d.index][j[i]] && _pm.p.models[d.index][j[i]].includes("*") && (!d.show || !child.name.match(d.show) && child.parent && !child.parent.name.match(d.show)))
                        if (j[i].match(/(remove)/)) {
                            d.remove = d.remove || [];
                            d.remove.push(child);
                        } else child.visible = !1;
            }
            if (child.name.includes("spr-")) {
                register.indicators = register.indicators || [];
                register.indicators.push(child);
            }
            if (child.isMesh) {
                if (_pm.model.needsFlip({ o: child })) {
                    d.nr = child.geometry.getAttribute("normal");
                    for(let i = 0; i < d.nr.count; i++)
                        d.nr.setXYZ(i, -d.nr.getX(i), -d.nr.getY(i), -d.nr.getZ(i));
                    d.nr.needsUpdate = !0;
                }
                if (!_pm.useWebGPU && (!_pm.p.dynamic || (_pm.p.dynamic && _pm.p.dynamic.videoTextures && !_pm.p.dynamic.videoTextures.includes(child.material.name))))
                    child.LOD = { offset: _pm.p.models[d.index].lod };
            }
            if (child.material) {
                d.m = findMaterial({ n: child.material.name });
                if (d.m) {
                    child.material = d.m;
                } else if (child.material && !child.material.modified) {
                    child.material.modified = !0;
                    if (_pm.p.models[d.index].stencil) {
                        if (child.material.name.includes("cloak-mask")) _pm.model.hideMaterial({ m: child.material });
                    }
                    if (child.material.name.toLowerCase().includes("light")) {
                        child.material.emissiveIntensity = 2.4;
                    } else if (child.material.name.toLowerCase().includes("glowing")) {
                        child.material.emissiveIntensity = .76;
                    } else child.material.emissiveIntensity = 0;
                    if (child.material.opacity < .65 && child.material.opacity > .2) {
                        let newMaterial;
                        try {
                            newMaterial = new THREE.MeshPhysicalMaterial({});
                        } catch (err) {
                            newMaterial = {};
                        }
                        try {
                            for (key in child.material) {
                                if (key in child.material) {
                                    if (child.material[key] === null) continue;
                                    if (child.material[key].isTexture) {
                                        newMaterial[key] = child.material[key];
                                    } else if (child.material[key].copy && child.material[key].constructor === newMaterial[key].constructor) {
                                        newMaterial[key].copy(child.material[key]);
                                    } else if (typeof child.material[key] === "number") newMaterial[key] = child.material[key];
                                }
                            }
                            newMaterial.opacity = 1;
                            newMaterial.transmission = 1;
                            child.material = newMaterial;
                        } catch (err) {}
                    }
                    for (let i = 0; i < textMaps.length; i++)
                        if (child.material[textMaps[i]]) {
                            child.material[textMaps[i]].anisotropy = _pm.useWebGPU ? renderer.getMaxAnisotropy() : renderer.capabilities.getMaxAnisotropy();
                            child.material[textMaps[i]].encoding = THREE.sRGBEncoding;
                            child.material[textMaps[i]].generateMipmaps = !0;
                            child.material[textMaps[i]].minFilter = THREE.LinearMipmapLinearFilter;
                            child.material[textMaps[i]].magFilter = THREE.LinearFilter;
                        }
                    if (child.material.emissiveMap && !child.material.lightMap) child.material.lightMap = child.material.emissiveMap;
                    if (csm && !_pm.useWebGPU && _pm.p.models[d.index].csm) csm.setupMaterial(child.material);
                    if (_pm.p.models[d.index].material && _pm.p.models[d.index].material[child.material.name])
                        _pm.model.naturalTexture({ c: child, index: d.index, dt: [] });
                    if (_pm.p.models[d.index].randomize && _pm.p.models[d.index].randomize.includes(child.material.name)) {
                        child.material.onBeforeCompile = (shader) => {
                            shader.uniforms["enableRandom"] = { value: 1 };
                            shader.uniforms["useNoiseMap"] = { value: 1 };
                            shader.uniforms["useSuslikMethod"] = { value: 1 };
                            shader.fragmentShader = shader.fragmentShader.replace("#include <alphamap_pars_fragment>", `
                                #ifdef USE_ALPHAMAP
                                    uniform sampler2D alphaMap;
                                    uniform float disolve;
                                    uniform float threshold;
                                #endif`);
                            shader.fragmentShader = shader.fragmentShader.replace("#include <alphamap_fragment>", `
                                #ifdef USE_ALPHAMAP
                                    float vv = texture2D( alphaMap, vAlphaMapUv ).g;
                                    float r = disolve * (1.0 + threshold * 2.0) - threshold;
                                    float mixf = clamp((vv - r)*(1.0/threshold), 0.0, 1.0);
                                    diffuseColor.a = mixf;
                                #endif`);
                        };
                    }
                }
                child.receiveShadow = child.castShadow = renderer.shadowMap.enabled;
                try {
                        for (let k = 0, l = ["videos", "interiors"]; k < l.length; k++)
                            if (_pm.p.models[d.index][l[k]]) {
                                if (l[k].match(/()/)) d.isAnimated = !0;
                                for (let i = 0, j; i < _pm.p.models[d.index][l[k]].length; i++) {
                                    j = _pm.p.models[d.index][l[k]][i];
                                    if (child.material.name == j.name) {
                                        if (l[k].match(/(videos)/)) {
                                            j.id = j.url.split("/").slice(-1)[0].replace(/\./g, "-");
                                            if (!document.getElementById(j.id))
                                                _pm.billboards.appendVideo({ id: j.id, url: j.url });
                                            if (!register.invideos) register.invideos = { data: {}, e: {}, dom: {} };
                                            if (j.emissiveIntensity) child.material.emissiveIntensity = j.emissiveIntensity;
                                            register.invideos.data[child.material.name] = { id: j.id, material: child.material, noLoad: j.noLoad, flipX: j.flipX, flipY: j.flipY };
                                            delete register.invideos.loaded;
                                        }
                                        if (l[k].match(/(interiors)/) && !_pm.useWebGPU) {
                                            if (!register.interiors)
                                                register.interiors = { data: {} };
                                            d.mt = d.mt || {};
                                            child.userData.material = child.material;
                                            d.b = getBoundingBox({ mesh: child });
                                            d.p = new THREE.Vector3();
                                            child.getWorldPosition(d.p);
                                            register.interiors.data[child.name] = {
                                                a: !1,
                                                p: d.p,
                                                j: j,
                                                s0: Math.sqrt(Math.pow(d.b.x, 2) + Math.pow(d.b.y, 2) + Math.pow(d.b.z, 2)) * (_pm.mobile ? 7.2 : 14.4),
                                                s1: Math.sqrt(Math.pow(d.b.x, 2) + Math.pow(d.b.y, 2) + Math.pow(d.b.z, 2)) * (_pm.mobile ? 2.4 : 3.6)
                                            };
                                        }
                                    }
                                }
                            }
                    } catch (err) {}
            }
            if (child.isLight) {
                child.castShadow = !0;
                child.shadow.bias = -0.003;
                child.shadow.mapSize.width = child.shadow.mapSize.height = 2048;
            }
        }
    });
    if (_pm.p.models[d.index].fitscale) {
        d.bbox = new THREE.Box3().setFromObject(gltf.scene);
        d.bscl = 1.5 / d.bbox.max.y;
        d.bscl = d.bscl < 0 ? -d.bscl : d.bscl;
        gltf.scene.scale.set(d.bscl, d.bscl, d.bscl);
    }
    if (_pm.p.models[d.index].isAvatar && _pm.p.models[d.index].isAvatar.isPlayer) {
        if (_pm.location) {
            try {
                _pm.p.models[d.index] = Object.assign(_pm.p.models[d.index], { position: { x: parseFloat(_pm.location[1]), y: parseFloat(_pm.location[2]), z: parseFloat(_pm.location[3]) }, rotation: { x: 0, y: parseFloat(_pm.location[4]), z: 0 } });
            } catch (error) {}
        } else if (_pm.p.models[d.index].isAvatar.isReload && localStorage.avatar) {
            d.a = JSON.parse(localStorage.avatar);
            if (d.a[loader.pIndex] && d.a[loader.pIndex].a)
                _pm.p.models[d.index] = Object.assign(_pm.p.models[d.index], { position: d.a[loader.pIndex].a.p, rotation: d.a[loader.pIndex].a.r });
        }
    }
    for (let i = 0, j = ["rotation", "position", "scale"]; i < j.length; i++) {
        if (_pm.p.models[d.index][j[i]])
            gltf.scene[j[i]].set((i == 0 ? Math.PI / 180 : 1) * _pm.p.models[d.index][j[i]].x, (i == 0 ? Math.PI / 180 : 1) * _pm.p.models[d.index][j[i]].y, (i == 0 ? Math.PI / 180 : 1) * _pm.p.models[d.index][j[i]].z);
    }
    new MaterialReducer().process(gltf.scene);
    gltf.scene.name = _pm.p.models[d.index].name;
    gltf.scene.visible = !_pm.p.models[d.index].hidden;
    if (_pm.p.physics && _pm.p.models[d.index].physics) {
        d.rID = (Math.random() + 1).toString(36).substring(7);
        gltf.scene.phyID = `${_pm.p.models[d.index].phyID = d.rID}-main`;
        gltf.scene.name += `-${gltf.scene.phyID}`;
        _pm.p.models[d.index].name = gltf.scene.name;
        d.uD = _pm.p.models[d.index].userData;
        gltf.scene.userData = Object.assign(d.uD || {}, { physics: _pm.p.models[d.index].physics, type: "gltf", id: gltf.scene.phyID, meshParts: {}, animations: {} });
        d = Object.assign(d, { wheels: [], corners: [] });
        d.rc = [];
        gltf.scene.traverse((child) => {
            if (child.name.match(/(Armature)/)) {
                gltf.scene.userData = Object.assign(gltf.scene.userData, {
                    behaviour: _pm.p.models[d.index].isAvatar && _pm.p.models[d.index].isAvatar.behaviour ? _pm.p.models[d.index].isAvatar.behaviour : null,
                    shapeType: (d.isAvatar = `${_pm.p.models[d.index].isAvatar && _pm.p.models[d.index].isAvatar.isCapsule ? "sphere" : "model"}`),
                    index: d.index
                });
                if (_pm.p.social && _pm.p.social.users[d.index]) {
                    d.a = gltf.scene.getObjectByName("spr-avatarinformation");
                    d.a.name += `${d.index}`;
                    _pm.p.models[d.index].userData = _pm.p.models[d.index].userData || {};
                    _pm.p.models[d.index].userData.markers = {
                        external: {
                            operations: {},
                            message: {
                                [`avatarinformation${d.index}`]: { type: "user-introduction", info: _pm.p.social.users[d.index] }
                            },
                            filter: [`avatarinformation${d.index}`],
                            proximity: {
                                [`avatarinformation${d.index}`]: 7
                            },
                            icons: {
                                [`avatarinformation${d.index}`]: {
                                    image: "avatar information.gif",
                                    size: _pm.mobile ? 36 : 64
                                }
                            }
                        },
                        remove: !0
                    };
                };
            }
            if ((child.name.match(/(phy-body-vehicle)/) || d.isAvatar) && !gltf.scene.userData.camera) gltf.scene.userData.camera = { position: [], target: [], lerp: { position: [], target: [] } };
            if (child.name.match(/(phy-mesh)/)) child.phyID = `${child.name}-${d.rID}`;
            if (d.isAvatar && child.material)
                if (!child.material.name.includes(d.rID)) {
                    if (_pm.p.models[d.index].materials && _pm.p.models[d.index].materials.colors) {
                        d.sel = _pm.p.models[d.index].materials.colors.values[child.material.name];
                        if (d.sel && d.sel.hex)
                            child.material.color = new THREE.Color(d.sel.hex[d.sel.index]);
                    };
                    if (_pm.p.models[d.index].colors && _pm.p.models[d.index].colors[child.material.name])
                        child.material.color = new THREE.Color(_pm.p.models[d.index].colors[child.material.name]);
                    child.material.name = `${child.material.name}-${d.rID}`;
                };
            if (child.material && child.material.name.match(/(lamp|signal)/))
                gltf.scene.userData[child.material.name] = child.material;
            if (child.name.match(/(phy-body-dynamic)/)) {
                child.updateMatrixWorld(!0);
                child.getWorldQuaternion(new THREE.Quaternion());
                child.getWorldPosition(new THREE.Vector3());
                child.updateMatrix();
                child.geometry.applyMatrix4(child.matrixWorld);
                loader.collider.geometries[`${d.index}-${(Math.random() + 1).toString(36).substring(7)}`] = { geo: child.geometry.clone() };
                d.l = !0;
                d.rc.push(child);
            } else if (child.name.match(/(phy-body-main|phy-body-part|phy-body-vehicle)/)) {
                d.type = child.name
                    .replace(/phy-body-main-|phy-body-part-|phy-body-vehicle-/g, "")
                    .replace(/_/g, ".")
                    .split("-");
                d.part = d.type[2];
                d.mass = parseFloat(d.type[1]);
                d.type = d.type[0];
                if (d.type && d.type.match(/(box|trimesh|polyhedron)/)) {
                    if (child.geometry) {
                        d.geometry = _pm.physics.mesh2Body({ type: d.type, scale: gltf.scene.scale, geometry: child.geometry.clone() });
                        if (child.name.match(/(part)/)) {
                            d.bp = new THREE.Vector3();
                            child.getWorldPosition(d.bp);
                        }
                        if (!child.name.match(/(vehicle)/)) {
                            _pm.physics.addMesh2Physics({
                                action: "add-body",
                                geometry: d.geometry,
                                position: d.bp || gltf.scene.position,
                                rotation: { x: gltf.scene.rotation.x, y: gltf.scene.rotation.y, z: gltf.scene.rotation.z },
                                boundingBox: getBoundingBox({ mesh: d.type.match(/(box)/) ? child : gltf.scene }),
                                mass: d.mass || 0,
                                type: d.type,
                                id: child.name.match(/(phy-body-main)/) ? `${d.rID}-main` : `phy-mesh-${d.part}-${d.rID}`,
                                isAvatar: d.isAvatar
                            });
                        } else d.isVehicle = !0;
                    }
                    d.rc.push(child);
                }
            }
            if (child.name.match(/(phy-act)/)) {
                gltf.scene.userData.vehicle = gltf.scene.userData.vehicle || { seat: {}, door: {} };
                d.v = child.name.replace("phy-act-", "");
                if (d.v.match(/(door|seat)/))
                    gltf.scene.userData.vehicle[d.v.split("-")[0]][d.v.split("-")[1]] = child;
                if (d.v.match(/(stand)/))
                    gltf.scene.userData[d.v.split("-")[0]][d.v.split("-")[1]] = child;
            }
            if (child.name.match(/(phy-corner)/)) {
                d.id = child.name.replace(/phy-corner-/g, "").split("-");
                gltf.scene.userData.meshParts[`${d.id[1]}-${d.rID}`] = `${d.id[1]}-${d.rID}`;
                d.corners.push({ radius: parseFloat(d.id[0].replace(/_/g, ".")), x: child.position.x, y: child.position.y, z: child.position.z });
                d.rc.push(child);
            }
            if (child.name.match(/(phy-wheel)/)) {
                d.wheels.push({
                    position: child.position,
                    rotation: { x: child.rotation.x, y: child.rotation.y, z: child.rotation.z },
                    boundingBox: getBoundingBox({ mesh: child }),
                    id: (child.phyID = `${child.name.replace(/phy-wheel/g, "phy-mesh")}-${d.rID}`),
                });
            }
            if (child.name.match(/(phy-boundary)/)) {
                gltf.scene.userData.boundaries.push(child.name);
                d.cg = child.geometry;
                d.cg.computeBoundingBox();
                d.cg.computeVertexNormals();
                for (let i = 0, j = new THREE.Vector3(), k; i < d.cg.attributes.position.count; i++) {
                    k = new THREE.Vector3().fromBufferAttribute(d.cg.attributes.position, i);
                    child.localToWorld(j.set(k.x, k.y, k.z));
                    d.cg.attributes.position.setXYZ(i, j.x, j.y, j.z);
                }
                d.cg.attributes.position.needsUpdate = !0;
                d.be = _pm.math.getBoundaryEdges({ a: child.geometry.attributes.position, i: child.geometry.index, e: [], s: [] });
                if (!1) {
                    _pm.math.traceBoundery({ boundaryEdges: d.be, color: 0xff0000, y: 10, isFrom: !0 });
                    _pm.math.traceBoundery({ boundaryEdges: d.be, color: 0x0000ff, y: 15 });
                }
                _pm.model.boundaries[`${child.name.replace(/phy-boundary-/g, "")}-${d.rID}`] = {
                    entering: gltf.scene.userData.entering ? structuredClone(gltf.scene.userData.entering) : !1,
                    time: performance.now(),
                    phyID: d.rID,
                    zone: d.be
                };
                d.rc.push(child);
            }
            if (child.name.match(/(phy-respawn)/)) {
                d.rs = d.rs || {};
                d.rs[child.name] = new THREE.Vector3();
                child.getWorldPosition(d.rs[child.name]);
            }
        });
        gltf.scene.traverse((child) => {
            if (child.name.match(/(camera-)/)) {
                d.acam = child.name.replace(/camera-/g, "").split("-");
                gltf.scene.userData.camera[d.acam[0]][d.acam[1]] = child;
                gltf.scene.userData.camera.lerp[d.acam[0]][d.acam[1]] = parseFloat(d.acam[2]) / 1000;
            }
        });
        if (d.l && _pm.p.avatar.isAvatarOrVehicle[_pm.user.uid]) {
            d.p = new THREE.Vector3();
            _pm.p.avatar.isAvatarOrVehicle[_pm.user.uid].mesh.getWorldPosition(d.p);
            _pm.model.updateColliders({ p: d.p });
        }
        if (d.rs) {
            _pm.p.avatar.revert.respawn = d.rs;
            if (!_pm.model.isInBoundaries({ b: _pm.model.boundaries, zn: "respawn-near" })) {
                d.a = register.avatar.meshes[register.user.uid[_pm.user.uid]];
                if (d.a && (!register.physics.enabled && d.a.userData.isFalling))
                    _pm.physics.revertUser({ phyID: d.a.phyID.replace(/-main/g, ""), p: _pm.p.avatar.revert.position, r: _pm.p.avatar.revert.rotation, rs: _pm.p.avatar.revert.respawn, re: !0 });
            }
        }
        for (let i = 0; i < d.rc.length; i++) {
            d.rc[i].removeFromParent();
            _pm.model.disposeHierarchy(d.rc[i]);
        }
        if (d.isAvatar) {
            gltf.scene.userData.speed = _pm.p.models[d.index].speed;
            register.avatar.meshes[gltf.scene.name] = gltf.scene;
            if (_pm.p.models[d.index].isAvatar) {
                if (_pm.p.models[d.index].isAvatar.isPlayer && !register.user.uid[_pm.user.uid]) register.user.uid[_pm.user.uid] = _pm.p.models[d.index].name;
                if (_pm.p.models[d.index].isAvatar.isOnline)
                    register.user.uid[d.index] = _pm.p.models[d.index].name;
                if (_pm.p.models[d.index].isAvatar.isCrowd) {
                    register.crowd.behaviour[(d.cid = [...crypto.getRandomValues(new Uint8Array(8))].map(b=>b.toString(16).padStart(2, "0")).join(""))] = _pm.behaviours ? new _pm.behaviours(_pm.p.behaviours) : null;
                    register.user.uid[d.cid] = _pm.p.models[d.index].name;
                }
            }
        }
        if (d.isVehicle) {
            gltf.scene.type = "vehicle";
            _pm.physics.addMesh2Physics({
                action: "add-vehicle",
                geometry: d.geometry,
                position: gltf.scene.position,
                rotation: { x: gltf.scene.rotation.x, y: gltf.scene.rotation.y, z: gltf.scene.rotation.z },
                boundingBox: getBoundingBox({ mesh: gltf.scene }),
                mass: d.mass || 0,
                type: d.type,
                id: `${d.rID}-main`,
                wheels: d.wheels,
                corners: d.corners,
                isVehicle: d.isVehicle,
            });
            register.vehicles.ids.push(`${d.rID}-main`);
            for (let k in d.wheels) register.vehicles.ids.push(d.wheels[k].id);
        }
    }
    gltf.scene.mIdx = d.index;
    if (_pm.p.camera.isAugmented && smoothedRoot) {
        if (_pm.p.models[d.index].arDebug) smoothedRoot.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshNormalMaterial({ transparent: !0, opacity: .5, side: THREE.DoubleSide })));
        smoothedRoot.add(gltf.scene);
    } else scene.add(gltf.scene);
    if (d.remove) {
        for (let i = 0; i < d.remove.length; i++)
            try {
                d.remove[i].removeFromParent();
                _pm.model.disposeHierarchy(d.remove[i]);
            } catch (error) {}
    }
    loadShadow({ index: d.index });
    if (gltf.animations.length > 0) {
        d.model = scene.getObjectByName(gltf.scene.name);
        d.model.animations = gltf.animations;
        d.isAnimated = !0;
    }
    if (d.isAvatar) {
        if (_pm.p.avatar)
            _pm.p.avatar.isAvatarOrVehicle[d.index] = _pm.model.isAvatarOrVehicle({ uid: d.index });
        setAvatarBehaviours({ name: "phyID", value: gltf.scene.phyID, isIdle: !0 });
        d.isAnimated = !0;
    }
    if (d.isAnimated) addAnimatedMesh(gltf.scene.name);
    if (d.uD)
        for (let i = 0, j = ["isNavigation", "isObstacle"]; i < j.length; i++)
            if (d.uD[j[i]])
                register.avatar.level[j[i].replace("is", "").toLowerCase()].push(gltf.scene);
    if (_pm.p.models[d.index].userData) {
        if (_pm.p.models[d.index].userData.markers && _pm.p.models[d.index].userData.markers.external)
            for (let i in _pm.p.models[d.index].userData.markers.external) {
                _pm.p.external = _pm.p.external || {};
                if (_pm.p.models[d.index].userData.markers.external[i].constructor.name != "Object") {
                    _pm.p.external[i] = _pm.p.external[i] || [];
                    if (!_pm.p.external[i].includes(_pm.p.models[d.index].userData.markers.external[i][0]))
                        _pm.p.external[i] = _pm.p.external[i].concat(_pm.p.models[d.index].userData.markers.external[i]);
                } else _pm.p.external[i] = Object.assign(_pm.p.external[i] || {}, _pm.p.models[d.index].userData.markers.external[i]);
            }
        if (_pm.p.models[d.index].userData.archive) {
            _pm.model.archived = _pm.model.archived.concat(_pm.p.models[d.index].userData.archive);
            if (!_pm.model.aBusy && register.busy.archived.now + 1536 < performance.now())
                _pm.model.reloadArchived({ now: register.busy.archived.now = performance.now(), a: _pm.model.archived, x: !0, i: 0 });
        }
        if (_pm.p.models[d.index].userData.animation) {
            if (_pm.p.models[d.index].userData.animation.play) {
                _pm.model.playMeshAnimation({ parent: _pm.p.models[d.index].name, any: !0, config: {
                    target: _pm.p.models[d.index].userData.animation.target,
                    start: 0,
                    speed: 1
                }});
            }
        }
    }
    if (_pm.p.models[d.index].userData && _pm.p.models[d.index].userData.unload)
            unloadModels({ models: _pm.p.models[d.index].userData.unload });
        if (_pm.p.avatar && _pm.p.avatar.revert.reposition) {
            d.uD = register.avatar.meshes[register.user.uid[_pm.user.uid]].userData;
            if (d.uD.isDriving || d.uD.isPassenger)
                _pm.physics.switchDriving({ uid: _pm.user.uid, drive: !1 });
            setTimeout(() => {
                _pm.p.avatar.revert.position = new THREE.Vector3();
                _pm.p.avatar.revert.reposition.getWorldPosition(_pm.p.avatar.revert.position);
                _pm.physics.revertUser({ phyID: _pm.p.avatar.isAvatarOrVehicle[_pm.user.uid].phyID.replace(/-main/g, ""), p: _pm.p.avatar.revert.position, q: _pm.p.avatar.revert.quaternion, rs: _pm.p.avatar.revert.respawn });
                delete _pm.p.avatar.revert.reposition;
                _pm.worker.aiPhysics.operation.postMessage({ action: "remove-bodies", bodies: ["ground-plane"] });
                _pm.model.updateColliders({ p: loader.collider.p });
            }, 320);
        }
    gltf = undefined
};
window.getBoundingBox = (d) => {
    d.box = new THREE.Box3().setFromObject(d.mesh);
    return { x: (d.box.max.x - d.box.min.x) / 2, y: (d.box.max.y - d.box.min.y) / 2, z: (d.box.max.z - d.box.min.z) / 2 };
};
window.createSpriteMaterial = (texture, cutout, i, typ) => {
    cutout = cutout || texture;
    texture.index = `${_pm.p[typ][i].sName}-texture`;
    _pm.p[`${typ}Data`].materials[_pm.p[typ][i].image.name] =
        typ == "sprites" ? new THREE.SpriteMaterial({ map: texture, alphaMap: cutout }) : new THREE.MeshBasicMaterial({ map: texture, alphaMap: cutout, transparent: _pm.p[typ][i].image.opaque ? !1 : !0 });
    return i;
};
window.addAnimatedMesh = (n) => {
    if (register.animated.models && !register.animated.models.includes(n)) register.animated.models.push(n);
};
window.render = async (now) => {
    if (register.next || register.last && 1 / (now - register.last) > 4.7e-2) {
        delete register.next;
        if (register.physics)
            _pm.physics.worldStep({ bodies: register.physics.bodies });
        if (mixers) {
            register.delta = clock.getDelta();
            register.deltaTime = Math.min(0.05, register.delta) / 5;
            Object.keys(mixers).forEach((key) => {
                if (mixers[key].userData) {
                    if (mixers[key].userData.isview && (!mixers[key].userData.delta || now >= mixers[key].userData.delta + mixers[key].userData.average * 6.3)) {
                        mixers[key].userData.delta = now;
                        mixers[key].update(register.delta);
                    }
                } else mixers[key].update(register.delta);
            });
        }
        if (Object.keys(register.animated.colors).length > 0) {
            for (let i in register.animated.colors) {
                if (!(register.animated.colors[i].material[register.animated.colors[i].mapName] instanceof THREE.Color)) 
                    register.animated.colors[i].material[register.animated.colors[i].mapmapName] = new THREE.Color(j);
                if (!(register.animated.colors[i].color instanceof THREE.Color)) 
                    register.animated.colors[i].color = new THREE.Color(register.animated.colors[i].color);
                if (!register.animated.colors[i].material[register.animated.colors[i].mapName].equals(register.animated.colors[i].color)) {
                    register.animated.colors[i].material.needsUpdate = !0;
                    register.animated.colors[i].material[register.animated.colors[i].mapName].lerp(register.animated.colors[i].color, .1);
                    register.animated.colors[i].material[register.animated.colors[i].mapName].limit = register.animated.colors[i].material[register.animated.colors[i].mapName].limit || 0;
                    if (register.animated.colors[i].material[register.animated.colors[i].mapName].limit > 24) {
                        _pm.model.setModelMaterial({
                            model: register.animated.colors[i].model,
                            name: register.animated.colors[i].name,
                            mapName: register.animated.colors[i].mapName,
                            value: register.animated.colors[i].value,
                            instant: !0
                        });
                        delete register.animated.colors[i];
                    } else register.animated.colors[i].material[register.animated.colors[i].mapName].limit++;
                    register.animation.update = !0;
                } else delete register.animated.colors[i];
            }
        }
        if (loopCounters.visible > 512) {
            loopCounters.visible = 0;
            isLostFocus({});
        } else loopCounters.visible++;
        if (magnify.snap == "restore") {
            magnify.snap = "restored";
            renderer.setPixelRatio(window.devicePixelRatio);
        }
        if (register.animation.update || (register.animated && register.animated.visible)) {
            delete register.animation.update;
            updateCameraPosition({});
            getIndicatorPositions({});
            navigateToDestination({});
            if (controls) controls.update();
            updateTextures({});
            if (_pm.p.camera.isAugmented && smoothedControls) {
                if (arToolkitSource.ready !== !1) arToolkitContext.update(arToolkitSource.domElement);
                smoothedControls.update(markerRoot1);
            }
            if (!_pm.p.avatar || (_pm.p.avatar && register.avatar.camera)) {
                try {
                    if (!postProcessing) 
                        await renderer[`render${_pm.useWebGPU ? "Async" : ""}`](scene, camera);
                    else postProcessing.render();
                    if (_pm.physics)
                        await _pm.physics.miniMap({});
                } catch (error) {}
            }
            if (!_pm.useWebGPU) {
                if (water) water.material.uniforms.time.value += 1 / 60;
                if (csm) csm.update();
            }
        }
        if (register.animated)
            if (_pm.controls.isOrbiting({ delay: 1024 }).halted) {
                delete register.events.orbiting;
                if (_pm.p.dynamic && _pm.p.dynamic.videoTextures)
                    isAnimatedVisible({ animated: register.animated.models, find: _pm.p.dynamic.videoTextures });
                _pm.model.optimizeAssets({});
            }
        growLens({});
        if (stats)
            stats.update();
    } else register.next = true;
    register.last = now;
};
window.setAvatarBehaviours = (d) => {
    d.mesh = _pm.model.getMesh({ p: d.name, k: d.value });
    if (d.mesh && !d.mesh.userData.dead) {
        if (!d.mesh.userData.isDriving && !d.mesh.userData.isPassenger) {
            if (d.isIdle || !d.acts) {
                if (register.avatar.meshes[register.user.uid[_pm.user.uid]] && d.mesh.name == register.avatar.meshes[register.user.uid[_pm.user.uid]].name) {
                    if (d.in = d.in = register.user.inputs[_pm.user.uid])
                        if (d.in.walk || d.in.stir || d.in.yaw)
                            d.prev = d.mesh.userData.animations[Object.keys(d.mesh.userData.animations)[0]];
                }
                d.acts = d.prev ? [d.prev] : register.avatar.idle;
                d.loop = !1;
            };
        } else d.acts = register.avatar.activities[d.mesh.userData.isDriving ? "driving" : "passenger"];
        if (d.acts) _pm.model.loadAvatarAnimation({ name: d.acts[Math.floor(Math.random() * d.acts.length)], mesh: d.mesh, loop: d.loop, fadeIn: d.fadeIn || .42 });
    };
};
window.loadAudio = (d) => {
    if (!d.remove) {
        d.buffer = register.audio.buffers[`${d.audio}`];
        if (d.audio)
            if (!d.buffer)
                loader.audio.load(`assets/models/sounds/${d.audio}`, (buffer) => setAudio(Object.assign(d, { buffer: register.audio.buffers[`${d.audio}`] = buffer })));
            else setAudio(Object.assign(d, { buffer: d.buffer }));
        else if (d.mesh.userData.audio) d.mesh.userData.audio.pause();
    }
};
window.download = () => {
    snaplink.setAttribute("download", "Snap.jpg");
    renderer.setPixelRatio(window.devicePixelRatio * 1.2);
    renderer.render(scene, camera);
    magnify.snap = "restore";
    renderer.domElement.toBlob((blob) => {
        snaplink.setAttribute("href", URL.createObjectURL(blob));
        snaplink.click();
    });
};
window.isLostFocus = (d) => {
    if (_pm.p.camera.resetView) {
        d.mesh = scene.getObjectByName(_pm.p.models[_pm.p.mIndex.selected].name);
        if (d.mesh && !isPositionInView({ p: d.mesh.position })) _pm.environment.setCamera({ position: register.views.positions.sequence[loader.pIndex][0], target: _pm.p.camera.target });
    }
};
window.isPositionInView = (d) => {
    d.frustum = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    return d.frustum.containsPoint(d.p);
};
window.isAnimatedVisible = (d) => {
    if (!register.animated.busy) {
        if (d.find) {
            if (register.animated) register.animated.visible = 60;
            if (register.invideos)
                for (let key in register.invideos.e)
                    if (register.invideos.data[key] && !register.invideos.data[key].material.userData.noplay)
                        register.invideos.data[key].material.userData.paused = !0;
            if (register.invideos)
                for (let key in register.invideos.e)
                    if (register.invideos.data[key] && register.invideos.data[key].material.userData.paused) {
                        d.n = document.getElementById(register.invideos.e[key]);
                        if (d.n) {
                            if (isVidPlaying({ video: d.n })) {
                                d.n.pause();
                                document.getElementById("in-canvas-motion-texture").removeChild((register.invideos.dom[register.invideos.e[key]] = d.n));
                            }
                        }
                    }
            if (d && d.animated && d.animated.length > 0)
                for (d.i = 0; d.i < d.animated.length; d.i++)
                    if (d.animated[d.i]) {
                        d.m = scene.getObjectByName(d.animated[d.i]);
                        if (d.m) {
                            d.frustum = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
                            d.m.traverse((child) => {
                                if (child.isMesh && ((d.frustum.containsPoint(child.position) && !1) || d.frustum.intersectsObject(child)))
                                    for (d.j = 0; d.j < d.find.length; d.j++) {
                                        if (register.invideos) {
                                            if (child.material.name == d.find[d.j]) {
                                                d.pos = new THREE.Vector3();
                                                child.getWorldPosition(d.pos);
                                                d.b = getBoundingBox({ mesh: child });
                                                if (camera.position.distanceTo(d.pos) < Math.sqrt(Math.pow(d.b.x, 2) + Math.pow(d.b.y, 2) + Math.pow(d.b.z, 2)) * 21 && register.invideos.data[d.find[d.j]] && !register.invideos.data[d.find[d.j]].material.userData.noplay) {
                                                    if (register.invideos.dom[register.invideos.e[d.find[d.j]]]) document.getElementById("in-canvas-motion-texture").appendChild(register.invideos.dom[register.invideos.e[d.find[d.j]]]);
                                                    d.n = document.getElementById(register.invideos.e[d.find[d.j]]);
                                                    if (d.n) {
                                                        delete register.invideos.data[d.find[d.j]].material.userData.paused;
                                                        register.animated.visible = !0;
                                                        if (!isVidPlaying({ video: d.n })) {
                                                            register.animated.busy = !0;
                                                            d.n.play();
                                                        }
                                                    } else
                                                        for (let i = 0, dom = document.getElementById("in-canvas-motion-texture").getElementsByTagName("video"); i < dom.length; i++)
                                                            if (dom[i].src.includes(d.find[d.j])) {
                                                                delete register.invideos.e[d.find[d.j]];
                                                                register.invideos.e[d.find[d.j]] = dom[i].id;
                                                            }
                                                }
                                            }
                                        } else if (child.name == d.find[d.j].sName) register.animated.visible = !0;
                                    }
                            });
                        }
                    }
        }
    }
};
window.isInteriorVisible = async (d) => {
    if (register.interiors) {
        if (!d.keys) d.keys = Object.keys(register.interiors.data);
        if (d.k < d.keys.length) {
            d.k++;
            d.i = register.interiors.data[d.keys[d.k - 1]];
            d.s = camera.position.distanceTo(d.i.p);
            if (register.busy.interiors.now + 96 < performance.now() && d.i.a != ((isPositionInView({ p: d.i.p }) && d.s < d.i.s0) || d.s < d.i.s1)) {
                register.busy.interiors.now = performance.now();
                requestIdleCallback(async () => {
                    d.i.a = !d.i.a;
                    d.mesh = _pm.model.getMesh({ p: "name", k: d.keys[d.k - 1] });
                    if (d.mesh) {
                        d.mesh.material.dispose();
                        d.mesh.material = d.i.a
                            ? await _pm.billboards.loadInteriorTexture({
                                url: d.i.j.url,
                                path: d.i.j.path,
                                cube: d.i.j.cube,
                                fov: d.i.j.fov,
                                flipY: d.i.j.flipY,
                                geometry: d.mesh.geometry,
                                metalness: d.mesh.userData.material.metalness,
                                roughness: d.mesh.userData.material.roughness,
                                exposure: 1.2,
                                lighten: .17
                            })
                            : d.mesh.userData.material;
                    }
                    setTimeout(() => isInteriorVisible(d), 1024);
                }, { timeout: 1536 })
            } else isInteriorVisible(d);
        } else delete _pm.model.iBusy;
    } else delete _pm.model.iBusy;
};
window.videoIsPlayed = (d) => {
    setTimeout(() => delete register.animated.busy, _pm.mobile ? 512 : 214);
    register.animated.visible = 360;
};
window.isVidPlaying = (e) => {
    return e.video.currentTime > 0 && !e.video.paused && !e.video.ended && e.video.readyState > e.video.HAVE_CURRENT_DATA;
};
window.hideCursorPointer = (d) => {
    if (!register.physics || (register.physics && register.physics.enabled)) {
        if (document.getElementById("loading-icon").style.display != "none") document.getElementById("loading-icon").style.display = "none";
        if (d.e) d.e.style.cursor = d.c ? "grabbing" : "grab";
        register.views.completed = register.clicked = !0;
    }
};
window.canvasFocused = () => {
    if (!register.focus) {
        register.focus = !0;
        register.animated.visible = 360;
    }
};
window.onHashChanged = (e) => {
    if (e && e.hash) {
        if (e.hash.includes("load=")) {
            if (register.physics) location.reload();
            e.index = parseInt(e.hash.replace("load=", ""));
            if (e.index !== "" && !isNaN(e.index)) {
                e.loader = _loader({ manager: loader.manager });
                if (e.loader.program.length > 0 && e.loader.program.length > e.index) {
                    loader = e.loader;
                    register = _setRegister();
                    mixers = {};
                    _pm.p = loader.program[(loader.pIndex = e.index)];
                    removeSceneObjects(["background", "environment", "backgroundNode", "environmentNode"]);
                    while (scene.children.length > 0) _pm.model.disposeHierarchy(scene.children[0]);
                    removeMotionTextures({});
                    loadProgram({});
                }
            }
        }
    }
};
window.removeMotionTextures = (d) => {
    while (document.getElementById("in-canvas-motion-texture").firstElementChild) document.getElementById("in-canvas-motion-texture").removeChild(document.getElementById("in-canvas-motion-texture").firstElementChild);
};
window.onbeforeunload = () => {
    saveLastLocation({ pos: new THREE.Vector3() });
};
window.saveLastLocation = (d) => {
    if (_pm.p.avatar) try {
        d.r = _pm.physics.getMyPosition({ uid: _pm.user.uid });
        if (_pm.p.avatar && d.r && d.r.position && d.r.position.x != 0 && d.r.position.z != 0) {
            if (localStorage.avatar)
                d.avatar = JSON.parse(localStorage.avatar);
            if (d.avatar && d.avatar[loader.pIndex])
                d.prev = d.avatar[loader.pIndex];
            if (d.r.isVehicle)
                for (let k in _pm.p.models)
                    if (_pm.p.models[k].name.match(d.r.isVehicle.name))
                        d.vehicle = k;
            d.r.position.y += .36;
            if (d.vehicle && register.user.vehicle[_pm.user.uid])
                register.user.vehicle[_pm.user.uid].door.getWorldPosition(d.pos);
            d.last = JSON.parse(`{
                "${loader.pIndex}" : ${JSON.stringify(Object.assign(d.prev || {}, {
                        vehicle: d.vehicle || (d.prev ? d.prev.vehicle : undefined),
                        entered: !_pm.model.entered ? (d.prev ? d.prev.entered : undefined) : _pm.model.entered,
                        a: { p: d.vehicle && d.pos ? d.pos : d.r.position, r: { x: 0, y: THREE.MathUtils.radToDeg(_pm.physics.getYDirection({q:d.r.quaternion}).y), z: 0, x1: (d.r.rotation.x * 180) / Math.PI, z1: (d.r.rotation.z * 180) / Math.PI } },
                        v: d.vehicle ? { p: register.user.vehicle[_pm.user.uid].mesh.position, r: { x: (register.user.vehicle[_pm.user.uid].mesh.rotation.x * 180) / Math.PI, y: (register.user.vehicle[_pm.user.uid].mesh.rotation.y * 180) / Math.PI, z: (register.user.vehicle[_pm.user.uid].mesh.rotation.z * 180) / Math.PI} } : d.prev && d.prev.v ? d.prev.v : undefined
                    }
                ))}
            }`);
            d.a = _pm.p.models[register.avatar.meshes[register.user.uid[_pm.user.uid]].userData.index];
            if (!d.last[loader.pIndex][d.a.file])
                d.last[loader.pIndex][(d.last[loader.pIndex].m = { n: d.a.file }).n] = {
                    materials: d.a.materials,
                    parts: d.a.parts,
                    show: d.a.show
                };
            if (d.avatar) {
                d.avatar.index = loader.pIndex;
                localStorage.avatar = JSON.stringify(Object.assign(d.avatar, d.last));
            } else localStorage.avatar = JSON.stringify(d.last);
        }
    } catch (error) {}
};