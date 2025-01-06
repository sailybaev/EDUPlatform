document.addEventListener('DOMContentLoaded', function () {
    const items = document.querySelectorAll('.carousel-item');
    const next = document.getElementById('next');
    const prev = document.getElementById('prev');
    let currentIndex = 0;

    function showSlide(index) {
        items.forEach((item, i) => {
            item.classList.remove('active');
            if (i === index) item.classList.add('active');
        });
    }

    next.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % items.length;
        showSlide(currentIndex);
    });

    prev.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        showSlide(currentIndex);
    });

    setInterval(() => {
        currentIndex = (currentIndex + 1) % items.length;
        showSlide(currentIndex);
    }, 10000); 
});
