import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
document.addEventListener('keydown', onDocumentKeyDown, false);

const DEFAULT_COLOR = "#A9BFD3";
const SELECTED_COLOR = "#FFB6C1";
const COLORS4 = ['#1E3888', '#47A8BD', '#F5E663', '#FFAD69'];
const COLOROSCAD = ['1,0,0', '0,1,0', '0,0,1','0.5,0,0.5','0,0.5,0.5','0.5,0.5,0'];
let colors = [];
let cubes = [];
let scales = [];
let translates = [];
let gtLabels = [];
let rotates = [];
let loaded_cubes = [];
let _current_code = null;
let code_to_save = null;
const obj = {
    get current_code() {
        return _current_code;
    },
    set current_code(value) {
        _current_code = value;
        // 这里触发你希望执行的操作
        onCodeChanged();
    }
};
let cur_file_id = null;
let cur_file_name = null;
let files = null;
document.getElementById('fileSelector').addEventListener('change', function(e) {
    console.log(e.target.files);
    files = e.target.files;
    const file = files[0]; // 获取选中的第一个文件
    cur_file_name = file.name;
    cur_file_id = 0;
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            obj.current_code = content;
            // console.log(content)
            // 更新HTML内容
            document.getElementById('fileContent').innerText = content;
        };

        reader.readAsText(file);
    }
});

function onCodeChanged() {
    // 当文档加载完成后执行以下代码
            // 获取显示文本的<div>元素
            console.log("changed!!!!!!!!");
            colors = [];
            cubes = [];
            scales = [];
            translates = [];
            gtLabels = [];
            rotates = [];
            if(loaded_cubes.length!=0){
                loaded_cubes.forEach(loaded_cube => {
                    scene.remove(loaded_cube);
                });
                loaded_cubes = []
            }
            let text = obj.current_code;
            code_to_save = obj.current_code;
            // 提取color信息
            const colorRegex = /color\(\[(.*?)\]\)/g;
            let match;
            
            while ((match = colorRegex.exec(text)) !== null) {
                colors.push(match[1].split(',').map(s => parseFloat(s.trim())));
            }

            // 提取gt_label信息 (这个关键词在提供的文本中没有看到，但假设它的格式是gt_label([numbers]))
            const gtLabelRegex = /\/\/gt label: (\w+)/g;
            
            while ((match = gtLabelRegex.exec(text)) !== null) {
                gtLabels.push(match[1]);
            }

            // 提取rotate信息
            const rotateRegex = /rotate\(\[(.*?)\]\)/g;
            
            while ((match = rotateRegex.exec(text)) !== null) {
                rotates.push(match[1].split(',').map(s => parseFloat(s.trim())));
            }

            // 提取cube信息 (在提供的文本中没有看到cube关键词，但这里为了例子，我假设它的格式是cube([numbers]))
            const cubeRegex = /cube\(\[(.*?)\]/g;
            // cube([16.143662482500076,6.146717518568046,1.3366424851119625],center=true);
            
            while ((match = cubeRegex.exec(text)) !== null) {
                cubes.push(match[1].split(',').map(s => parseFloat(s.trim())));
            }

            // 提取translate信息
            const translateRegex = /translate\(\[(.*?)\]\)/g;
            
            while ((match = translateRegex.exec(text)) !== null) {
                translates.push(match[1].split(',').map(s => parseFloat(s.trim())));
            }
            
            const scaleRegex = /scale\(\[(.*?)\]\)/g;
            
            while ((match = scaleRegex.exec(text)) !== null) {
                scales.push(match[1].split(',').map(s => parseFloat(s.trim())));
            }
            console.log(scales);
            // const container = document.getElementById("textOutput");

            // gtLabels.forEach((label, index) => {
            // const labelElement = document.createElement("p");
            // labelElement.textContent = `id: ${index}. label: ${label}`;
            // container.appendChild(labelElement);
            // });
            // outputDiv.textContent = colors;
            const uniqueGtLabels = [...new Set(gtLabels)];
            if(cubes.length==rotates.length){
                cubes.forEach((cubeItem, index) =>{
                    const translateItem = translates[index];
                    const rotateItem = rotates[index];
                    const GTLABELid = uniqueGtLabels.indexOf(gtLabels[index]);
                    // console.log(cubeItem,translateItem,rotateItem)
                    const geometry = new THREE.BoxGeometry( cubeItem[0],cubeItem[2], cubeItem[1] );
                    const material = new THREE.MeshBasicMaterial( { color: COLORS4[GTLABELid] } );
                    const cubeN = new THREE.Mesh( geometry, material );
                    // if(index==0){
                    cubeN.userData.id = index.toString();
                    cubeN.userData.label = gtLabels[index];
                    cubeN.castShadow = true;
                    cubeN.receiveShadow = true;
                    console.log(cubeN);
                    scene.add(cubeN);
                    loaded_cubes.push(cubeN)
                    // }        
                    cubeN.rotation.order = 'ZYX';
                    cubeN.position.x = translateItem[0];
                    cubeN.position.y = translateItem[1];
                    cubeN.position.z = translateItem[2];
                    cubeN.rotation.x = THREE.MathUtils.degToRad(rotateItem[0]+90);
                    cubeN.rotation.y = THREE.MathUtils.degToRad(rotateItem[1]);
                    cubeN.rotation.z = THREE.MathUtils.degToRad(rotateItem[2]); 
            })
            
        }else if(scales.length == rotates.length){
            scales.forEach((scaleItem, index) =>{
                const translateItem = translates[index];
                const rotateItem = rotates[index];
                const GTLABELid = uniqueGtLabels.indexOf(gtLabels[index]);
                // console.log(cubeItem,translateItem,rotateItem)
                const geometry = new THREE.SphereGeometry(1, 32, 32);  // 1是球体的半径
                const material = new THREE.MeshBasicMaterial({ color: DEFAULT_COLOR }); // 绿色
                const sphereN = new THREE.Mesh(geometry, material);

                // 缩放球体以创建椭圆
                sphereN.scale.set(scaleItem[0], scaleItem[1], scaleItem[2]);  // 假设a, b, c分别是x, y, z轴上的截距

                // if(index==0){
                sphereN.userData.id = index.toString();
                sphereN.userData.label = gtLabels[index];
                sphereN.castShadow = true;
                sphereN.receiveShadow = true;
                console.log(sphereN);
                scene.add(sphereN);
                loaded_cubes.push(sphereN)
                // }        
                sphereN.rotation.order = 'ZYX';
                sphereN.position.x = translateItem[0];
                sphereN.position.y = translateItem[1];
                sphereN.position.z = translateItem[2];
                sphereN.rotation.x = THREE.MathUtils.degToRad(rotateItem[0]);
                sphereN.rotation.y = THREE.MathUtils.degToRad(rotateItem[1]);
                sphereN.rotation.z = THREE.MathUtils.degToRad(rotateItem[2]); 
        })
    }
        
};



document.getElementById('option1').addEventListener('click', function() {
    // console.log('选项1被点击');
    //to leg
    const uniqueGtLabels = [...new Set(gtLabels)];        
    const GTLABELid = uniqueGtLabels.indexOf('leg');
    previous_selected_obj.material.color.set(COLORS4[GTLABELid]);
    console.log(previous_selected_obj.userData);
    previous_selected_obj.userData.label = 'leg';
    code_to_save  = modifyNthGTLabel(code_to_save,parseInt(previous_selected_obj.userData.id,10),'leg')
    console.log(code_to_save)
    previous_selected_obj = null;
    previous_selected_color = null;
    contextMenu.style.display = 'none';  // 关闭菜单
});

document.getElementById('option2').addEventListener('click', function() {
    console.log('选项2被点击');
    const uniqueGtLabels = [...new Set(gtLabels)];        
    const GTLABELid = uniqueGtLabels.indexOf('top');
    previous_selected_obj.material.color.set(COLORS4[GTLABELid]);
    previous_selected_obj.userData.label = 'top';
    code_to_save = modifyNthGTLabel(code_to_save,parseInt(previous_selected_obj.userData.id,10),'top')
    console.log(code_to_save)
    previous_selected_obj = null;
    previous_selected_color = null;
    contextMenu.style.display = 'none';  // 关闭菜单
});

document.getElementById('option3').addEventListener('click', function() {
    const uniqueGtLabels = [...new Set(gtLabels)];        
    const GTLABELid = uniqueGtLabels.indexOf('bot');
    previous_selected_obj.material.color.set(COLORS4[GTLABELid]);
    previous_selected_obj.userData.label = 'bot';
    code_to_save = modifyNthGTLabel(code_to_save,parseInt(previous_selected_obj.userData.id,10),'bot')
    previous_selected_obj = null;
    previous_selected_color = null;
    contextMenu.style.display = 'none';  // 关闭菜单
});


function onDocumentKeyDown(event) {
    let delta = 1; // 定义移动距离
    console.log(event.keyCode);
    switch (event.keyCode) {
        case 87: // W key
            camera.position.z -= delta;
            break;
        case 83: // S key
            camera.position.z += delta;
            break;
        case 65: // A ka aey
            camera.position.x -= delta;
            break;
        case 68: // D key
            camera.position.x += delta;
            break;
        case 81: //qq
            saveTextAsFile(code_to_save, cur_file_name);
            break;
        case 37:
            if(files.length ===0) return;
            if(cur_file_id>0){
                cur_file_id --;
                
                let file = files[cur_file_id];
                // console.log(file);
                cur_file_name = file.name;
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const content = e.target.result;
                        obj.current_code = content;
                        console.log(obj);
                        document.getElementById('fileContent').innerText = content;
                    };
            
                    reader.readAsText(file);
                }
            }
            break;
        case 39:
            if(files.length ===0) return;
            if(cur_file_id<files.length){
                cur_file_id ++;
                let file = files[cur_file_id];
                cur_file_name = file.name;
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const content = e.target.result;
                        obj.current_code = content;
                        document.getElementById('fileContent').innerText = content;
                    };
            
                    reader.readAsText(file);
                }
            }
            break;
            
    }
}
window.addEventListener('click', onDocumentMouseDown, false);
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let previous_selected_color = null;
let previous_selected_obj = null;
function onDocumentMouseDown(event) {
    if (event.target.id !== 'fileSelector') {
        event.preventDefault();
    }
    
    // 将鼠标点击位置转换为归一化设备坐标 (-1 到 +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // 更新射线投射器的射线
    raycaster.setFromCamera(mouse, camera);

    // 获取射线与物体的交点
    const intersects = raycaster.intersectObjects(loaded_cubes);

    if (intersects.length > 0) {
        
        if(previous_selected_obj){
            previous_selected_obj.material.color.set(previous_selected_color); 
        }
        const selectedObject = intersects[0].object;
        console.log(selectedObject.userData.label);   
        previous_selected_obj = selectedObject;
        document.getElementById('textOutput').innerText = `id: ${selectedObject.userData.id}. label: ${gtLabels[selectedObject.userData.id]}`;
        previous_selected_color = JSON.parse(JSON.stringify(selectedObject.material.color));
        
        selectedObject.material.color.set(SELECTED_COLOR); 
        
    }
}


// 监听窗口大小变化
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    // 更新相机的宽高比
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // 更新渲染器的大小
    renderer.setSize(window.innerWidth, window.innerHeight);
}

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();

let contextMenu = document.getElementById('customContextMenu');
contextMenu.addEventListener('click', function(event) {
    event.stopPropagation();
});
renderer.domElement.addEventListener('mousedown', function(event) {
    if (event.button === 2) {
        contextMenu.style.display = 'block'; // 首先确保它是可见的
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';
        setTimeout(() => { // 延迟以确保初始透明状态
            contextMenu.style.opacity = '1';
        }, 10);
        event.stopPropagation();
    } else {
        contextMenu.style.opacity = '0'; 
        setTimeout(() => { // 由于过渡效果，我们稍后隐藏菜单
            contextMenu.style.display = 'none';
        }, 300); // 这应该与CSS中的过渡时间匹配
    }
});

// renderer.domElement.addEventListener('mousedown', function(event) {
//     if (event.button === 2) {
//         contextMenu.style.display = 'block'; // 首先确保它是可见的
//         contextMenu.style.left = event.clientX + 'px';
//         contextMenu.style.top = event.clientY + 'px';
//         setTimeout(() => { // 延迟以确保初始透明状态
//             contextMenu.style.opacity = '1';
//         }, 10);
//     } else {
//         contextMenu.style.opacity = '0'; 
//         setTimeout(() => { // 由于过渡效果，我们稍后隐藏菜单
//             contextMenu.style.display = 'none';
//         }, 300); // 这应该与CSS中的过渡时间匹配
//     }
// });


renderer.shadowMap.enabled = true;

// 设置物体以投射和接收阴影
renderer.setSize( window.innerWidth, window.innerHeight );
// document.body.appendChild( renderer.domElement );
document.getElementById('webglContainer').appendChild(renderer.domElement);



// loaded_cubes.forEach((loaded_cube, index)=>
// {
//     scene.add(loaded_cube);
//     console.log("test",loaded_cube)
// })
// });
let axesHelper = new THREE.AxesHelper(50); // 参数5定义了轴的长度
scene.add(axesHelper)
let controls = new OrbitControls( camera, renderer.domElement );
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);  // 第一个参数是光的颜色，第二个参数是光的强度
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 100, 100);  // 第一个参数是光的颜色，第二个参数是光的强度，第三个参数是光的照射距离
pointLight.position.set(0, 0, 70);  // 设置光源的位置
// 设置光源以投射阴影
pointLight.castShadow = true;
scene.add(pointLight);

camera.position.z = 50;
camera.position.y = 20;
controls.update();
animate();
function animate() {
    requestAnimationFrame( animate );
    camera.lookAt(0,0,0);
    controls.update();
    renderer.render( scene, camera );
}
// 1. 监听键盘事件


// 2. 使用浏览器的Blob和a标签功能保存文本到本地
function saveTextAsFile(text, filename) {
    const blob = new Blob([text], {type: "text/plain;charset=utf-8"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    // 使用 MouseEvent 模拟真实的点击事件
    const event = new MouseEvent('click', {
        'bubbles': true,
        'cancelable': true,
        'view': window
    });
    a.dispatchEvent(event);

    URL.revokeObjectURL(url);
}


function modifyNthGTLabel(text, n, newValue) {
    const lines = text.split('\n');
    let count = 0;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('//gt label:')) {
            console.log(count, n);
            if (count === n) {
                lines[i] = `//gt label: ${newValue}`;
                break;
            }
            count++;
        }
    }
    return lines.join('\n');
}


// scene.add( cube );
