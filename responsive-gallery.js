function log(message) {
    var D = true;
    if (D)
        console.log(message);
}

function ResponsiveGallery() {
    this.rg = document.querySelector('.responsiveGallery');
    this.container = this.rg.querySelector('.rg-container');
    this.itemCount = this.rg.querySelectorAll('.rg-item').length;

    // Length of all the images combined
    this.containerWidth = 0;

    // Drag
    this.isDragEnabled = false;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartLeft = 0;

    this.init();
}

ResponsiveGallery.prototype.init = function () {
    log("ResponsiveGallery initialize");

    // Calculate length of all the images combined
    var items = this.container.querySelectorAll('.rg-item');
    for (var i = 0; i < this.itemCount; i++) {
        this.containerWidth += items[i].clientWidth;
    }

    // Set width of container to total length 
    this.container.style.width = this.containerWidth + 'px';

    // If all the images fits in the container
    var rgViewWidth = this.rg.querySelector('.rg-view').clientWidth;
    if (this.containerWidth < rgViewWidth) {
        log("All images fits the container");
        // Disable slider
        this.sliderEnabled = false;
        this.isDragEnabled = false;

        // Remove controls
        this.rg.querySelector('.controls .next').style.display = 'none';
        this.rg.querySelector('.controls .prev').style.display = 'none';

        // Bring the images to the center
        this.container.style.position = "relative";
        this.container.style.marginLeft = this.container.style.marginRight = "auto";
    } else {
        var self = this;

        // Add listeners to controls
        var leftControl = this.rg.querySelector('.controls .next');
        var rightControl = this.rg.querySelector('.controls .prev');
        leftControl.addEventListener('click', function () {
            self.movePrev();
        });
        rightControl.addEventListener('click', function () {
            self.moveNext();
        });

        // Remove image drag for slider drag
        var items = this.container.querySelectorAll('.rg-item');
        for (var i = 0; i < items.length; i++) {
            items[i].querySelector('img').draggable = false;
        }

        // Drag listeners
        this.container.addEventListener('mousedown', function (ev) {
            self.handleMouseDown(ev);
        });
        this.container.addEventListener('mouseup', function (ev) {
            self.handleMouseUp(ev);
        });
        this.container.addEventListener('mousemove', function (ev) {
            self.handleMouseMove(ev);
        })
    }
}

ResponsiveGallery.prototype.getItemAt = function (pos) {
    return this.rg.querySelector('[data-pos="' + pos + '"]');
}

ResponsiveGallery.prototype.getActive = function () {
    // Get active item and remove active class
    return this.rg.querySelector('.rg-item.active');
}

ResponsiveGallery.prototype.setActive = function (pos) {
    log('setActive: ' + pos);

    // Get active item and remove active class
    var activeItem = this.getActive();
    activeItem.classList.remove('active');

    // Get new pos item and set as current
    activeItem = this.rg.querySelector('[data-pos="' + pos + '"]');
    activeItem.classList.add('active');
}

ResponsiveGallery.prototype.setAndMoveToActive = function (pos) {
    this.setActive(pos);
    var activeItem = this.getActive();

    anime({
        targets: '.responsiveGallery .rg-container',
        left: '-' + activeItem.offsetLeft + 'px',
        duration: 400,
        easing: 'easeInOutCirc'
    });
}

// ########################################
//                Controls
// ########################################
ResponsiveGallery.prototype.moveNext = function () {
    log('moveNext');
    var activeItem = this.getActive();

    // If white space will be visible after move
    var containerLeft = parseInt(this.container.style.left) - activeItem.clientWidth
    this.adjustMove(containerLeft);

    // Get new position
    var newPos = activeItem.dataset.pos;
    newPos++;
    if (newPos > this.itemCount)
        newPos = 1;

    this.setAndMoveToActive(newPos);
}

ResponsiveGallery.prototype.movePrev = function () {
    log("movePrev");
    var activeItem = this.getActive();

    // Get new position
    var newPos = activeItem.dataset.pos;
    newPos--;
    if (newPos < 1)
        newPos = this.itemCount;

    var prevItem = this.rg.querySelector('[data-pos="' + newPos + '"]');

    // If white space will be visible after move
    var containerLeft = parseInt(this.container.style.left) + prevItem.clientWidth
    this.adjustMove(containerLeft)

    this.setAndMoveToActive(newPos);
}

ResponsiveGallery.prototype.adjustMove = function (containerLeft) {
    // Adjust move right
    while (containerLeft > 0 ) {
        log('White space visible on the left');

        // Move the last child to first
        var firstItem = this.container.firstElementChild;
        var lastItem = this.container.lastElementChild;
        this.container.insertBefore(lastItem, firstItem);

        // Move the container to adjust for the moved item
        this.container.style.left = parseInt(this.container.style.left) - lastItem.clientWidth + 'px';
        containerLeft -= lastItem.clientWidth;
    }

    // Adjust move left
    var screenWidth = document.body.clientWidth;
    // width of visible part of container
    var visibleContainerWidth = this.containerWidth + containerLeft;
    var firstItem = this.container.firstElementChild;
    while (screenWidth > visibleContainerWidth && Math.abs(containerLeft) >= firstItem.clientWidth) {
        adjusted = true;
        log('White space visible on the right');

        // Move the first item to last
        this.container.appendChild(firstItem);
        
        // Move the container to adjust for the moved item
        this.container.style.left = parseInt(this.container.style.left) + firstItem.clientWidth + 'px';
        containerLeft += firstItem.clientWidth;
        
        // Adjustment for drag
        if (this.isDragging) {
            this.dragStartLeft += firstItem.clientWidth;
        }
        
        firstItem = this.container.firstElementChild;
        visibleContainerWidth += firstItem.clientWidth;
    }
}

// ########################################
//                 Drag
// ########################################
ResponsiveGallery.prototype.moveLeft = function (distance) {
    var leftValue = parseInt(this.container.style.left) - distance;

    this.adjustMove(leftValue);
}

ResponsiveGallery.prototype.handleMouseDown = function (ev) {
    log('handleMouseDown');

    if (ev.which === 1) { // is left click
        this.isDragging = true;
        this.dragStartX = ev.pageX;
        this.dragStartLeft = parseInt(this.container.style.left);
        if (isNaN(this.dragStartLeft))
            this.dragStartLeft = 0;
    }
}

ResponsiveGallery.prototype.handleMouseUp = function (ev) {
    log('handleMouseUp');

    if (ev.which === 1) { // is left click
        this.isDragging = false;
        if (Math.abs(this.dragStartX - ev.pageX) < 5) {
            log('is click');
            // open gallery

            var clickPos = ev.target.parentElement.dataset.pos;
        }
    }
}

ResponsiveGallery.prototype.handleMouseMove = function (ev) {
    log('handleMouseMove');

    if (ev.which === 1 && this.isDragging) { // is left click
        log('drag');
        this.container.style.left = (this.dragStartLeft + ev.pageX - this.dragStartX) + 'px';

        this.adjustMove(parseInt(this.container.style.left));
    }
}

ResponsiveGallery.prototype.getCurrentPosition = function () {
    log(this.rg.style.left);
}

var rg;
window.addEventListener('load', function () {
    rg = new ResponsiveGallery();

});