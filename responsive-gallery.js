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

    // Add listeners to controls
    var leftControl = this.rg.querySelector('.controls .next');
    var rightControl = this.rg.querySelector('.controls .prev');
    var rgInstance = this;
    leftControl.addEventListener('click', function () {
        rgInstance.movePrev();
    });
    rightControl.addEventListener('click', function () {
        rgInstance.moveNext();
    });
}

ResponsiveGallery.prototype.getItemAt = function (pos) {
    return this.rg.querySelector('[data-pos="' + pos + '"]');
}

ResponsiveGallery.prototype.getActive = function () {
    // Get active item and remove active class
    return this.rg.querySelector('.rg-item.active');
}

ResponsiveGallery.prototype.setActive = function (pos) {
    log('set Active to ' + pos);

    // Get active item and remove active class
    var activeItem = this.getActive();
    activeItem.classList.remove('active');

    // Get new pos item and set as current
    activeItem = this.rg.querySelector('[data-pos="' + pos + '"]');
    activeItem.classList.add('active');

    anime({
        targets: '.responsiveGallery .rg-container',
        left: '-' + activeItem.offsetLeft + 'px',
        duration: 400,
        easing: 'easeInOutCirc'
    });
}

ResponsiveGallery.prototype.moveNext = function () {
    var activeItem = this.getActive();

    // If white space will be visible after move
    var screenWidth = document.body.clientWidth;
    var containerRightSide = this.containerWidth + parseInt(this.container.style.left) - activeItem.clientWidth
    if (screenWidth - containerRightSide < 0) {
        var firstItem = this.container.firstElementChild;
        this.rg.querySelector('.rg-container').insertAfter(activeItem, firstItem);
    }

    // Get new position
    var newPos = activeItem.dataset.pos;
    newPos++;
    if (newPos > this.itemCount) {
        newPos = 1;
    } else {
        var lastPos = this.container.lastElementChild.dataset.pos;
        if (lastPos == newPos) {
            log("aaaa");
        }
    }

    this.setActive(newPos);
}

ResponsiveGallery.prototype.movePrev = function () {
    var activeItem = this.getActive();

    // Get new position
    var newPos = activeItem.dataset.pos;
    newPos--;
    if (newPos < 1)
        newPos = this.itemCount;

    this.setActive(newPos);
}

ResponsiveGallery.prototype.getCurrentPosition = function () {
    log(this.rg.style.left);
}

var rg;
window.addEventListener('load', function () {
    rg = new ResponsiveGallery();

});

// // Handle sliding to the left
// // (bring the rightmost img to the left)
// var firstItem = this.rg.querySelector('.rg-item');
// var lastItem = this.rg.querySelector('.rg-item:last-child');
// this.rg.querySelector('.rg-container').insertBefore(lastItem, firstItem);
// // slide the rg-container to show the original first item
// this.container.style.left = '-' + lastItem.offsetWidth + 'px';