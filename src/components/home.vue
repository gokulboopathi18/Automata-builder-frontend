<template>
    <div id="home">
        <div id="mainGroup">
            <img src="../assets/images/icons8-processor-100.png" id="mainImg"/>
            <h1 id="mainTitle">Meet Christopher</h1>
            <router-link to="/bletchleypark"><b-button>Get Started</b-button></router-link>
        </div>
        <canvas class="background"></canvas>
    </div> 
</template>

<script>
import Particles from 'particlesjs'

export default{
    name: "Home",
    mounted(){
        Particles.init({
            selector: '.background',
            maxParticles: 120,
            speed: 0.1,
            sizeVariations: 2,
            minDistance: 170,
            color: '#A3B8B3',
            connectParticles: true
        })
    }
}
</script>

<style lang="scss" scoped>
#home{
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    background: rgb(243, 243, 243);

    #mainGroup{
        z-index: 1;

        #mainImg{
            padding-bottom: 15px;
            height: 100px;
            transition: all 0.6s;
        }

        #mainImg:hover{
            height: 120px;
            transition: all 0.6s;
        }

        #mainTitle{
            padding-bottom: 5px;
        }

        button{
            background: $primary-accent;
            color: #ffffff;
            font-size: 18px;
            box-shadow: 2px 2px 4px rgba(0,0,0,0.2);
            border: none;
        }

        button:hover{
            box-shadow: none;
        }
    }
}

.background {
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    z-index: 0;
}

</style>