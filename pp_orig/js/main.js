(function (KES) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if (KES('#spinner').length > 0) {
                KES('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner(0);
    
    
    // Initiate the wowjs
    new WOW().init();
    
    
   // Back to top button
   KES(window).scroll(function () {
    if (KES(this).scrollTop() > 300) {
        KES('.back-to-top').fadeIn('slow');
    } else {
        KES('.back-to-top').fadeOut('slow');
    }
    });
    KES('.back-to-top').click(function () {
        KES('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Modal Video
    KES(document).ready(function () {
        var KESvideoSrc;
        KES('.btn-play').click(function () {
            KESvideoSrc = KES(this).data("src");
        });
        console.log(KESvideoSrc);

        KES('#videoModal').on('shown.bs.modal', function (e) {
            KES("#video").attr('src', KESvideoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
        })

        KES('#videoModal').on('hide.bs.modal', function (e) {
            KES("#video").attr('src', KESvideoSrc);
        })
    });


    // Facts counter
    KES('[data-toggle="counter-up"]').counterUp({
        delay: 10,
        time: 2000
    });


    // Testimonial carousel
    KES(".testimonial-carousel-1").owlCarousel({
        loop: true,
        dots: false,
        margin: 25,
        autoplay: true,
        slideTransition: 'linear',
        autoplayTimeout: 0,
        autoplaySpeed: 10000,
        autoplayHoverPause: false,
        responsive: {
            0:{
                items:1
            },
            575:{
                items:1
            },
            767:{
                items:2
            },
            991:{
                items:3
            }
        }
    });

    KES(".testimonial-carousel-2").owlCarousel({
        loop: true,
        dots: false,
        rtl: true,
        margin: 25,
        autoplay: true,
        slideTransition: 'linear',
        autoplayTimeout: 0,
        autoplaySpeed: 10000,
        autoplayHoverPause: false,
        responsive: {
            0:{
                items:1
            },
            575:{
                items:1
            },
            767:{
                items:2
            },
            991:{
                items:3
            }
        }
    });

})(jQuery);

