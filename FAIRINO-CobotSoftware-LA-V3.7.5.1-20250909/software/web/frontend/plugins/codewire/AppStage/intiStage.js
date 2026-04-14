let canvasMove = false;
frapp.factory('AppStage', function () {
    let AppStage = {};
    let initialDistance = 0;

    AppStage.zoomScale = 1.05;
    AppStage.shapeIsDragging = false;
    AppStage.shapeTouchingDirection = [],    // can be array of 'top', 'bottom', 'left', 'right'
    AppStage.getStage = function (width, height, container_name) {
        console.log(width, height);
        let stage = new Konva.Stage({
            container: container_name,
            width: width,
            height: height,
            draggable: false,
        });
        AppStage.zoomScale = 1.05;
        stage.on('wheel', (e) => {
            e.evt.preventDefault();
            var oldScale = stage.scaleX();
            var pointer = stage.getPointerPosition();

            var mousePointTo = {
                x: (pointer.x - stage.x()) / oldScale,
                y: (pointer.y - stage.y()) / oldScale,
            };
            var newScale = oldScale;
            var checkScale = e.evt.deltaY > 0 ? oldScale / AppStage.zoomScale : oldScale * AppStage.zoomScale;
            if (checkScale > 0.175 && checkScale < 1.6) {
                newScale = checkScale;
            }
            stage.scale({ x: newScale, y: newScale });

            var newPos = {
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale,
            };
            stage.container().style.backgroundSize = `${stage.scaleX() * 10}rem ${stage.scaleY() * 10}rem`;
            stage.position(newPos);
            stage.batchDraw();
            stage.container().style.backgroundPosition = `${stage.position().x}px ${stage.position().y}px`;
        });
        stage.container().tabIndex = 1;
        stage.container().focus();

        stage.on('mousedown', function (e) {
            if (e.target === stage && (e.evt.button == 0 || e.evt.button == 1)) {
                stage.draggable(true);
            }
        });
        stage.on('mouseup', function (e) {
            if (e.evt.button == 0 || e.evt.button == 1) {
                stage.draggable(false);
            }
        });
        stage.on('dragmove', (e) => {
            if (e.target == stage) {
                stage.container().style.backgroundPosition = `${stage.position().x}px ${stage.position().y}px`;
            }
        })
        stage.on('touchstart', function (e) {
            if (e.target === stage && e.evt.touches.length == 1) {
                stage.draggable(true);
            } else {
                stage.draggable(false);
            }
            const touches = e.evt.touches;
            if (touches.length >= 2) {
                initialDistance = Math.sqrt(
                    Math.pow(touches[1].clientX - touches[0].clientX, 2) +
                    Math.pow(touches[1].clientY - touches[0].clientY, 2)
                );
            }
        });
        stage.on('touchend', function (e) {
            stage.draggable(false);
        });
        stage.on('touchmove', (e) => {
            document.getElementById("nodeEditorFileName").focus();
            document.getElementById("nodeEditorFileName").blur();
            canvasMove = true;
            var touches = e.evt.touches;
            if (e.target == stage && touches.length == 1) {
                stage.container().style.backgroundPosition = `${stage.position().x}px ${stage.position().y}px`;
            }
            if (touches.length >= 2) {
                stage.draggable(false);
                var currentDistance = Math.sqrt(
                    Math.pow(touches[1].clientX - touches[0].clientX, 2) +
                    Math.pow(touches[1].clientY - touches[0].clientY, 2)
                );
                var delta = currentDistance - initialDistance > 0 ? -100 : 100;
                var oldScale = stage.scaleX();
                var pointer = stage.getPointerPosition();
                var mousePointTo = {
                    x: (pointer.x - stage.x()) / oldScale,
                    y: (pointer.y - stage.y()) / oldScale,
                };
                var newScale = oldScale;
                var checkScale = delta > 0 ? oldScale / AppStage.zoomScale : oldScale * AppStage.zoomScale;
                if (checkScale > 0.175 && checkScale < 1.6) {
                    newScale = checkScale;
                }
                stage.scale({ x: newScale, y: newScale });
                var newPos = {
                    x: pointer.x - mousePointTo.x * newScale,
                    y: pointer.y - mousePointTo.y * newScale,
                };
                stage.container().style.backgroundSize = `${stage.scaleX() * 10}rem ${stage.scaleY() * 10}rem`;
                stage.position(newPos);
                stage.batchDraw();
                stage.container().style.backgroundPosition = `${stage.position().x}px ${stage.position().y}px`;
            }
        })
        window.addEventListener('resize', () => {
            let container = document.querySelector('#container');
            if (container) {
                let containerWidth = container.offsetWidth;
                let scale = containerWidth / stage.width();
                stage.width(container.offsetWidth);
                stage.height(container.offsetHeight);
                stage.draw();
            }
        });
        return stage;
    }

    return AppStage;
})