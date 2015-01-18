
function Animation(keyframes, drawers) {
    var player,
        playing = false,
        speed = 1,
        direction = 1;

    var seasons = d3.scale.ordinal()
            .domain(d3.range(4))
            .range(["winter", "spring", "summer", "autumn"]);

    function update_caption(step, year) {
        var season = seasons(step%12);
        
        d3.select("h1.season")
            .html([season, year].join(" "));
    }
    
    function timeline_explore(direction) {
        pause();
        
        if (direction) {
            make_step(direction);
        }
    }

    var make_step = (function () {
        var step = 0,
            year = 1945;

        return function (direction) {
            direction || (direction = 1);
            if (step+direction <= 0
                || step >= keyframes.length) {
                
                pause();
                return;
            };

            drawers.draw_keyframe(keyframes[step]);

            if (direction > 0) {
                update_caption(step, year);

                step += direction;
                
                if (step%4 == 0) {
                    year += direction;
                }
            }else{
                step += direction;
                
                if (step%4 == 0) {
                    year += direction;
                }

                update_caption(step, year);
            }
        };
    })();
    
    function toggle_controls() {                    
        d3.select("#play_forward")
            .classed("hidden", playing && direction > 0);
        d3.select("#play_backward")
            .classed("hidden", playing && direction < 0);

        d3.select(".left .pause")
            .classed("hidden", !playing || direction > 0);
        d3.select(".right .pause")
            .classed("hidden", !playing || direction < 0);

        d3.select(".left .speedUp")
            .classed("hidden", !playing || direction > 0);
        d3.select(".right .speedUp")
            .classed("hidden", !playing || direction < 0);
    }

    function stop () {
        playing = false;
        clearInterval(player);
    }

    function start () {
        playing = true;
        player = setInterval(function () {
            make_step(direction);
        }, speed*500);
    }

    function pause () {
        stop();
        toggle_controls();
    }
    
    return {
        pause: pause,
        make_step: make_step,
        timeline_explore: timeline_explore,

        play_forward: function () {
            stop();

            speed = 1;
            direction = 1;

            start();                        
            toggle_controls();
        },

        play_backward: function () {
            stop();

            speed = 1;
            direction = -1;

            start();
            toggle_controls();
        },

        speedUp: function () {
            if (!playing) return;

            stop();
            speed /= 1.5;
            start();
        },

        slowDown: function () {
            if (!playing) return;

            stop();
            speed *= 1.5;
            start();
        }
    };
};
