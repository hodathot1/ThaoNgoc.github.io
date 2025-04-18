// Set up Three.js scene
let scene, camera, renderer, heart;
let particles = [];
let isHeartVisible = false;
let letterRead = false;
let mouseX = 0, mouseY = 0;
let targetRotationX = 0;
let targetRotationY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

function init() {
    // Tạo scene
    scene = new THREE.Scene();

    // Thiết lập camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Thiết lập renderer với hiệu ứng tốt hơn
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        precision: 'highp'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('container').appendChild(renderer.domElement);

    // Ẩn container chứa trái tim ban đầu
    document.getElementById('container').style.opacity = '0';

    // Tạo trái tim (không hiển thị ngay)
    createHeart();

    // Thêm ánh sáng môi trường
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Thêm ánh sáng hướng
    const directionalLight = new THREE.DirectionalLight(0xff5db1, 1.2);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Thêm ánh sáng điểm để tạo hiệu ứng sáng hơn
    const pointLight1 = new THREE.PointLight(0xff0080, 2.5, 10);
    pointLight1.position.set(2, 2, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff5db1, 2.5, 10);
    pointLight2.position.set(-2, -2, 2);
    scene.add(pointLight2);

    // Thêm ánh sáng điểm để làm nổi bật trái tim
    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(0, 5, 7);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.2;
    spotLight.decay = 2;
    spotLight.distance = 50;
    spotLight.castShadow = true;
    scene.add(spotLight);

    // Thêm sự kiện chuột để xoay trái tim
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('touchstart', onDocumentTouchStart, false);
    document.addEventListener('touchmove', onDocumentTouchMove, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);

    // Xử lý khi thay đổi kích thước cửa sổ
    window.addEventListener('resize', onWindowResize);

    // Thiết lập hiệu ứng lấp lánh theo chuột
    setupSparkles();

    // Xử lý sự kiện cho lá thư
    setupLetterEvents();

    // Bắt đầu vòng lặp animation
    animate();
}

function createHeart() {
    // Tạo hình dạng trái tim đẹp hơn
    const heartShape = new THREE.Shape();

    // Công thức hình trái tim với độ chính xác cao hơn
    const x = 0, y = 0;
    const scale = 1.2; // Làm trái tim to hơn một chút

    // Vẽ trái tim với đường cong đẹp hơn và mượt mà hơn
    heartShape.moveTo(x, y + 0.5 * scale);

    // Phần trên của trái tim với nhiều điểm kiểm soát hơn
    heartShape.bezierCurveTo(
        x, y + 0.8 * scale,
        x - 0.4 * scale, y + 0.95 * scale,
        x - 0.75 * scale, y + 0.5 * scale
    );

    // Phần dưới bên trái được làm mịn hơn
    heartShape.bezierCurveTo(
        x - 1.25 * scale, y - 0.1 * scale,
        x - 0.9 * scale, y - 0.7 * scale,
        x - 0.5 * scale, y - 0.8 * scale
    );

    // Phần dưới giữa
    heartShape.bezierCurveTo(
        x - 0.25 * scale, y - 0.9 * scale,
        x, y - 0.7 * scale,
        x, y - 0.5 * scale
    );

    // Phần dưới bên phải được làm mịn hơn
    heartShape.bezierCurveTo(
        x, y - 0.7 * scale,
        x + 0.25 * scale, y - 0.9 * scale,
        x + 0.5 * scale, y - 0.8 * scale
    );

    heartShape.bezierCurveTo(
        x + 0.9 * scale, y - 0.7 * scale,
        x + 1.25 * scale, y - 0.1 * scale,
        x + 0.75 * scale, y + 0.5 * scale
    );

    // Hoàn thiện phần trên bên phải
    heartShape.bezierCurveTo(
        x + 0.4 * scale, y + 0.95 * scale,
        x, y + 0.8 * scale,
        x, y + 0.5 * scale
    );

    // Tạo các tùy chọn geometry với chi tiết cao hơn
    const extrudeSettings = {
        depth: 0.8,
        bevelEnabled: true,
        bevelSegments: 12, // Tăng số đoạn để làm mịn viền
        bevelSize: 0.2,    // Giảm kích thước viền để trông mịn hơn
        bevelThickness: 0.2,
        curveSegments: 96  // Tăng số đoạn cong để tạo hình dáng mượt mà hơn
    };

    // Tạo geometry và material 
    const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);

    // Tạo material đẹp hơn với hiệu ứng ánh sáng
    const material = new THREE.MeshPhongMaterial({
        color: 0xff0080,
        emissive: 0x400020,
        specular: 0xffffff,
        shininess: 150,
        reflectivity: 1,
        side: THREE.DoubleSide
    });

    // Tạo mesh trái tim
    heart = new THREE.Mesh(geometry, material);
    heart.scale.set(0.6, 0.6, 0.6);
    heart.rotation.x = Math.PI;
    heart.position.y = 0.2;

    // Tạo group để chứa trái tim, giúp xoay dễ dàng hơn
    heartGroup = new THREE.Group();
    heartGroup.add(heart);
    scene.add(heartGroup);

    // Thêm các đốm sáng vào trái tim
    addGlowingDots();
}

// Hàm mới để tạo các đốm sáng trên bề mặt trái tim
function addGlowingDots() {
    const dotCount = 300;
    const dotGeometry = new THREE.SphereGeometry(0.02, 12, 12);

    // Sử dụng các màu khác nhau cho đốm sáng
    const dotColors = [
        0xffffff, // Trắng
        0xff88a8, // Hồng nhạt
        0xff5db1, // Hồng đậm
        0xffb6c1, // Hồng tươi
        0xffd700  // Vàng gold
    ];

    // Lấy vertices từ trái tim để đặt đốm sáng lên bề mặt
    const positions = heart.geometry.attributes.position;

    for (let i = 0; i < dotCount; i++) {
        // Chọn một vị trí ngẫu nhiên trên bề mặt trái tim
        const randomIndex = Math.floor(Math.random() * positions.count);
        const x = positions.getX(randomIndex);
        const y = positions.getY(randomIndex);
        const z = positions.getZ(randomIndex);

        // Tạo material cho đốm sáng
        const dotMaterial = new THREE.MeshBasicMaterial({
            color: dotColors[Math.floor(Math.random() * dotColors.length)],
            transparent: true,
            opacity: Math.random() * 0.5 + 0.5,
        });

        // Tạo đốm sáng
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        dot.position.set(x, y, z);

        // Thêm thuộc tính cho hiệu ứng nhấp nháy
        dot.userData = {
            originalOpacity: dotMaterial.opacity,
            pulseFactor: Math.random() * 0.5 + 0.5,
            pulseSpeed: Math.random() * 0.01 + 0.005
        };

        // Thêm đốm sáng vào trái tim
        heart.add(dot);

        // Lưu đốm sáng vào mảng particles
        particles.push(dot);
    }
}

// Hàm xử lý sự kiện chuột nhấn xuống
function onDocumentMouseDown(event) {
    event.preventDefault();

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('mouseout', onDocumentMouseOut, false);

    mouseXOnMouseDown = event.clientX - windowHalfX;
    mouseYOnMouseDown = event.clientY - windowHalfY;
    targetRotationXOnMouseDown = targetRotationX;
    targetRotationYOnMouseDown = targetRotationY;
}

// Hàm xử lý sự kiện chuột di chuyển
function onDocumentMouseMove(event) {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;

    if (event.buttons === 1) { // Chỉ xoay khi nhấn chuột
        targetRotationX = targetRotationXOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.005;
        targetRotationY = targetRotationYOnMouseDown + (mouseY - mouseYOnMouseDown) * 0.005;
    }
}

// Hàm xử lý sự kiện chuột thả ra
function onDocumentMouseUp() {
    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    document.removeEventListener('mouseup', onDocumentMouseUp, false);
    document.removeEventListener('mouseout', onDocumentMouseOut, false);
}

// Hàm xử lý sự kiện chuột ra khỏi cửa sổ
function onDocumentMouseOut() {
    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    document.removeEventListener('mouseup', onDocumentMouseUp, false);
    document.removeEventListener('mouseout', onDocumentMouseOut, false);
}

// Hàm xử lý sự kiện chạm màn hình (cho thiết bị di động)
function onDocumentTouchStart(event) {
    if (event.touches.length === 1) {
        event.preventDefault();

        mouseXOnMouseDown = event.touches[0].pageX - windowHalfX;
        mouseYOnMouseDown = event.touches[0].pageY - windowHalfY;
        targetRotationXOnMouseDown = targetRotationX;
        targetRotationYOnMouseDown = targetRotationY;
    }
}

// Hàm xử lý sự kiện di chuyển khi chạm (cho thiết bị di động)
function onDocumentTouchMove(event) {
    if (event.touches.length === 1) {
        event.preventDefault();

        mouseX = event.touches[0].pageX - windowHalfX;
        mouseY = event.touches[0].pageY - windowHalfY;
        targetRotationX = targetRotationXOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.005;
        targetRotationY = targetRotationYOnMouseDown + (mouseY - mouseYOnMouseDown) * 0.005;
    }
}

function createParticles() {
    // Tạo hạt với hiệu ứng đẹp hơn
    const particleCount = 150;

    // Tạo texture tròn cho hạt
    const particleTexture = new THREE.CanvasTexture(createCircleTexture());

    // Tạo geometry cho hạt - sử dụng hình cầu nhỏ làm đốm sáng
    const particleGeometry = new THREE.SphereGeometry(0.035, 12, 12);

    // Tạo các material khác nhau cho hạt
    const colors = [0xff0080, 0xff5db1, 0xff88a8, 0xffb6c1, 0xffffff];

    for (let i = 0; i < particleCount; i++) {
        // Chọn màu ngẫu nhiên từ bảng màu
        const material = new THREE.MeshBasicMaterial({
            color: colors[Math.floor(Math.random() * colors.length)],
            transparent: true,
            opacity: 0.8,
            map: particleTexture
        });

        const particle = new THREE.Mesh(particleGeometry, material);

        // Vị trí ngẫu nhiên xung quanh trái tim
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = 2 + Math.random() * 3;

        particle.position.x = radius * Math.sin(phi) * Math.cos(theta);
        particle.position.y = radius * Math.sin(phi) * Math.sin(theta);
        particle.position.z = radius * Math.cos(phi);

        // Tốc độ và hướng ngẫu nhiên cho hạt
        particle.userData = {
            speed: Math.random() * 0.01 + 0.005,
            initialPos: particle.position.clone(),
            phase: Math.random() * Math.PI * 2,
            frequency: 0.2 + Math.random() * 0.5
        };

        // Thêm hạt vào scene
        scene.add(particle);

        // Lưu vào mảng particles
        particles.push(particle);
    }
}

function setupSparkles() {
    // Thiết lập canvas cho hiệu ứng lấp lánh theo chuột
    const sparkleCanvas = document.getElementById('sparkles');
    const ctx = sparkleCanvas.getContext('2d');
    sparkleCanvas.width = window.innerWidth;
    sparkleCanvas.height = window.innerHeight;

    // Mảng lưu các hạt lấp lánh
    const sparkles = [];

    // Cấu trúc cho mỗi hạt lấp lánh
    class Sparkle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 3 - 1.5;
            this.speedY = Math.random() * 3 - 1.5;
            this.color = `hsl(${Math.random() * 60 + 320}, 100%, ${Math.random() * 30 + 70}%)`;
            this.life = Math.random() * 0.5 + 0.5;
            this.maxLife = this.life;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life -= 0.01;

            if (this.life <= 0) {
                return false;
            }
            return true;
        }

        draw() {
            ctx.globalAlpha = this.life / this.maxLife;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
        }
    }

    // Tọa độ chuột
    let mouseX = 0;
    let mouseY = 0;
    let lastX = 0;
    let lastY = 0;

    // Theo dõi di chuyển chuột
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Hàm tạo hạt lấp lánh
    function createSparkles() {
        // Khoảng cách di chuyển
        const dx = mouseX - lastX;
        const dy = mouseY - lastY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Tạo hạt dựa trên khoảng cách di chuyển
        const particleCount = Math.floor(distance / 10);

        for (let i = 0; i < particleCount; i++) {
            const x = lastX + dx * (i / particleCount);
            const y = lastY + dy * (i / particleCount);
            for (let j = 0; j < 3; j++) {
                sparkles.push(new Sparkle(x, y));
            }
        }

        lastX = mouseX;
        lastY = mouseY;
    }

    // Hàm vẽ các hạt lấp lánh
    function drawSparkles() {
        ctx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);
        ctx.globalCompositeOperation = 'lighter';

        for (let i = sparkles.length - 1; i >= 0; i--) {
            if (!sparkles[i].update()) {
                sparkles.splice(i, 1);
            } else {
                sparkles[i].draw();
            }
        }

        createSparkles();
        requestAnimationFrame(drawSparkles);
    }

    // Kích hoạt hiệu ứng lấp lánh
    drawSparkles();
}

function setupLetterEvents() {
    const envelope = document.querySelector('.envelope');
    const letter = document.querySelector('.letter');
    const closeButton = document.querySelector('.close-letter');
    const container = document.getElementById('container');
    const nameElement = document.querySelector('.name');

    // Khởi tạo - hiển thị phong bì, ẩn trái tim
    container.style.opacity = '0';
    nameElement.style.opacity = '0';

    // Khi nhấn vào phong bì
    envelope.addEventListener('click', () => {
        // Hiển thị lá thư
        letter.classList.add('active');
        envelope.style.opacity = '0';

        // Sau khi đọc xong thư, đánh dấu đã đọc
        letterRead = true;
    });

    // Khi nhấn nút đóng thư
    closeButton.addEventListener('click', () => {
        // Ẩn lá thư
        letter.classList.remove('active');
        letter.style.opacity = '0';

        // Sau khoảng thời gian, hiện trái tim
        setTimeout(() => {
            // Ẩn hoàn toàn lá thư và phong bì
            envelope.style.display = 'none';
            letter.style.display = 'none';

            // Hiển thị trái tim và tên
            container.style.opacity = '1';
            nameElement.style.opacity = '1';

            // Đánh dấu trái tim đã hiển thị
            isHeartVisible = true;
        }, 500);
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Cập nhật kích thước cho canvas hiệu ứng lấp lánh
    const sparkleCanvas = document.getElementById('sparkles');
    sparkleCanvas.width = window.innerWidth;
    sparkleCanvas.height = window.innerHeight;
}

function animate() {
    requestAnimationFrame(animate);

    // Áp dụng xoay mượt mà với damping
    if (heartGroup) {
        heartGroup.rotation.y += (targetRotationX - heartGroup.rotation.y) * 0.05;
        heartGroup.rotation.x += (targetRotationY - heartGroup.rotation.x) * 0.05;
    }

    // Hiệu ứng nhấp nháy cho các đốm sáng trên bề mặt trái tim
    if (heart) {
        heart.children.forEach(dot => {
            if (dot.userData) {
                const time = Date.now() * 0.001;
                const pulse = Math.sin(time * dot.userData.pulseSpeed * 5) * dot.userData.pulseFactor;
                dot.material.opacity = dot.userData.originalOpacity * (0.7 + pulse * 0.3);

                // Thay đổi kích thước nhẹ
                const scale = 0.8 + pulse * 0.2;
                dot.scale.set(scale, scale, scale);
            }
        });
    }

    // Animation cho các hạt xung quanh
    particles.forEach(particle => {
        // Chỉ xử lý các hạt không phải là đốm sáng trên bề mặt trái tim
        if (particle.parent !== heart) {
            const time = Date.now() * 0.001;
            const initialPos = particle.userData.initialPos;
            const frequency = particle.userData.frequency;
            const phase = particle.userData.phase;

            // Di chuyển theo đường cong sin/cos
            particle.position.x = initialPos.x + Math.sin(time * frequency + phase) * 0.3;
            particle.position.y = initialPos.y + Math.cos(time * frequency + phase) * 0.3;
            particle.position.z = initialPos.z + Math.sin(time * frequency * 0.5 + phase) * 0.3;

            // Thay đổi độ trong suốt
            particle.material.opacity = 0.4 + Math.sin(time * frequency * 2 + phase) * 0.4;
        }
    });

    renderer.render(scene, camera);
}

// Thêm Google Font cho văn bản
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap';
document.head.appendChild(fontLink);

// Khởi tạo cảnh khi trang tải xong
window.addEventListener('load', init);