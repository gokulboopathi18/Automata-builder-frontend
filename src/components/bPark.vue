<template>
    <!-- Component top level container -->
    <div id="bParkBase">
        <!-- Top bar with logo and tools -->
        <b-navbar id="bParkTopBar" toggleable="lg" type="dark">
            <!-- Logo and action buttons -->
            <b-navbar-brand title="Home">
                <router-link to="/">
                    <img src="../assets/images/icons8-processor-100.png" id="brandLogo"/>
                </router-link>
                <b-button-group id="actionButtonGroup">
                    <button id="storeButton" size="sm" @click="storeMachine">
                        Store Machine
                    </button>

                    <button id="runButton" size="sm" @click="runMachine">
                        Run Machine
                    </button>
                </b-button-group>
            </b-navbar-brand>

            <!-- Draggable state elments -->
            <b-navbar-nav class="ml-auto" id="toolBar">
                <!-- Regular State -->
                <Drag :data="stateNames[0]" @dragstart="() => {this.dragNDropping = true;}">
                    <State v-bind:state_id="currentState" />
                </Drag>

                <!-- Start State -->
                <Drag :data="stateNames[1]" v-bind:style="{ opacity: startStateOpacity }" :disabled="startDisabled" @dragstart="() => {this.dragNDropping = true;}">
                    <StartState />
                </Drag>

                <!-- Final State -->
                <Drag :data="stateNames[2]" @dragstart="() => {this.dragNDropping = true;}">
                    <FinalState />
                </Drag>
            </b-navbar-nav>
        </b-navbar>

        <!-- Dotted work area -->
        <Drop @drop="dropped" id="workArea">
            <canvas id="c" :height="canvasHeight" :width="canvasWidth"> </canvas>
        </Drop>

        <!-- Modal for transitions prompt-->
        <b-modal id="modal-trans" 
            title="Transitions" 
            centered ok-only 
            no-close-on-backdrop 
            no-close-on-esc 
            hide-header-close
            @ok="transitionStringEntered"
        >
            <b-form-input v-model="alphabets" placeholder="Alphabets go here" autocomplete="off" autofocus></b-form-input>
        </b-modal>

        <!-- Modal for machine name prompt -->
        <b-modal id="modal-name" 
            title="Give your machine a name" 
            centered ok-only 
            no-close-on-backdrop 
            no-close-on-esc 
            hide-header-close
            @ok="modalNameEntered"
        >
            <b-form-input v-model="machineName" placeholder="What do you want to call this machine?" autocomplete="off" autofocus></b-form-input>
        </b-modal>

        <!-- Modal for test string prompt -->
        <b-modal id="modal-string" 
            title="String" 
            centered ok-only 
            no-close-on-backdrop 
            no-close-on-esc 
            hide-header-close
            @ok="modalStringEntered"
        >
            <b-form-input v-model="testString" placeholder="Got a string to test?" autocomplete="off" autofocus></b-form-input>
        </b-modal>

        <!-- Mutipurpose notifications -->
        <notifications 
            group="notifications" 
            position = "bottom left"
            closeOnClick
        />

        <!-- Run machine result modal -->
        <b-modal
            id="run-result"
            title="Ran machine"
            centered hide-footer hide-header
        >
            <div id="run-modal-container">
                <div v-if="accepted" id="run-icon-success">
                    <b-icon icon="check-circle-fill"></b-icon>
                </div>
                <div v-else id="run-icon-error">
                    <b-icon icon="x-circle-fill"></b-icon>
                </div>
                <div id="run-text">
                    '{{testString}}' was <font v-if="accepted">ACCEPTED</font> <font v-else>REJECTED</font>
                </div>
            </div>
        </b-modal>

    </div>
</template>

<script>
import State from "./state.vue";
import StartState from "./startState.vue";
import FinalState from "./finalState.vue";
import { Drag, Drop } from "vue-easy-dnd";
import axios from 'axios'


export default {
    name: "BPark",
    data: function() {
        return {
            machineName: "",
            currentState: 0,
            stateTypes: [0, 1, 2],
            alphabets: "",
            canvasArea: null,
            accepted: false,
            can: null,
            testString: "",
            endRadians: 2 * Math.PI,
            canvasHeight: 500,
            canvasWidth: 500,
            radius: 25,
            startStateOpacity: 1,
            dragNDropping: false,
            startDisabled: false,
            machineHash: null,
            workArea: null,
            stateNames: ["REG", "STA", "FIN"],
            stateMachine: [],
            lastDownState: null,
            currentToState: null,
            currentTransitionObject: null,
        };
    },

    components: { State, StartState, FinalState, Drag, Drop },

    methods: {
        // Event trigger when a draggable element in dropped in the work area
        dropped(dropData) {
            let newY = 0;
            if (dropData.data == this.stateNames[0]) {
                // regular state
                newY = this.drawState(dropData.position.x,dropData.position.y,this.radius);
            } else if (dropData.data == this.stateNames[1]) {
                // start state
                this.startStateOpacity = 0.5;
                this.startDisabled = true;
                newY = this.drawStartState(dropData.position.x, dropData.position.y, this.radius);
            } else if (dropData.data == this.stateNames[2]) {
                // final state
                newY = this.drawFinalState(dropData.position.x, dropData.position.y, this.radius);
            }

            this.stateMachine.push({
                state: this.currentState,
                stateType: dropData.data,
                graphicArea: {
                    x: dropData.position.x,
                    y: newY,
                    threshold: Math.pow(this.radius + 5, 2),
                    radius: this.radius,
                },
                transitions: []
            });

            this.currentState += 1;
            this.dragNDropping = false;
        },

        // Draw a regular state in the work area
        drawState(centerX, centerY, radius) {
            let newY = centerY - document.getElementById("bParkTopBar").offsetHeight;
            this.canvasArea.beginPath();
            this.canvasArea.arc(centerX, newY, radius, 0, this.endRadians);
            this.canvasArea.stroke();
            return newY;
        },

        // Draw a start state in the work area
        drawStartState(centerX, centerY, radius) {
            let newY = centerY - document.getElementById("bParkTopBar").offsetHeight;
            this.canvasArea.beginPath();
            this.canvasArea.arc(centerX, newY, radius, 0, this.endRadians);
            this.canvasArea.moveTo(centerX - radius, newY);
            this.canvasArea.lineTo(centerX - radius - 30, newY);
            this.canvasArea.stroke();
            return newY;
        },

        // Draw a final state in the work area
        drawFinalState(centerX, centerY, radius) {
            let newY = centerY - document.getElementById("bParkTopBar").offsetHeight;
            this.canvasArea.beginPath();
            this.canvasArea.arc(centerX, newY, radius, 0, this.endRadians);
            this.canvasArea.arc(centerX, newY, radius + 5, 0, this.endRadians);
            this.canvasArea.stroke();
            return newY;
        },

        // Mouse down event trigger - for drawing transitions
        canvasDown(clickEvent) {
            if (this.dragNDropping) {
                return false;
            }

            this.lastDownState = this.findNearestState(
                clickEvent.clientX,
                clickEvent.clientY - document.getElementById("bParkTopBar").offsetHeight
            );

            if (this.lastDownState == null) {
                return null;
            }
        },

        // Mouse up event trigger - for drawing transitions
        canvasUp(clickEvent) {
            if (this.dragNDropping || this.lastDownState == null) {
                return false;
            }

            this.currentToState = this.findNearestState(
                clickEvent.clientX,
                clickEvent.clientY - document.getElementById("bParkTopBar").offsetHeight
            );

            if (this.currentToState === null) {
                return false;
            }

            if (this.lastDownState === this.currentToState) {
                this.drawLoopArc(this.lastDownState.graphicArea,this.currentToState.graphicArea)
            } else {
                this.drawArcBetweenAreas(this.lastDownState.graphicArea,this.currentToState.graphicArea)
            }
        },

        // To draw a transition loop to the same state and open the alphabets prompt
        drawLoopArc(startCircle, endCircle){
            let theta = 0;
            let thetaAdd = 0.523599; // 30 degrees extra so that the lines aren't all from the same point

            let startNewPoint = { x: null, y: null };
            let endNewPoint = { x: null, y: null };
            let controlPoint = { x: null, y: null }
            let BHeight = 0;
            let thetaComplement = 0;

            this.canvasArea.beginPath()

            startNewPoint.y = startCircle.y - Math.sin(theta + thetaAdd) * startCircle.radius
            startNewPoint.x = startCircle.x + Math.cos(theta + thetaAdd) * startCircle.radius
            endNewPoint.y = endCircle.y + Math.sin(theta - thetaAdd) * endCircle.radius
            endNewPoint.x = endCircle.x - Math.cos(theta - thetaAdd) * endCircle.radius

            // drawing the arcs between the circles
            this.canvasArea.moveTo(startNewPoint.x, startNewPoint.y)
            BHeight = 40
            thetaComplement = 1.5708 - theta
            controlPoint.x = (startNewPoint.x + endNewPoint.x) / 2 - Math.cos(thetaComplement) * BHeight
            controlPoint.y = (endNewPoint.y + startNewPoint.y) / 2 - (Math.sin(thetaComplement) * BHeight * 2)  
            this.canvasArea.quadraticCurveTo(
                controlPoint.x,
                controlPoint.y,
                endNewPoint.x, endNewPoint.y
            );

            this.canvasArea.stroke()

            this.currentTransitionObject = {
                start: startNewPoint,
                end: endNewPoint,
                control: controlPoint,
            }

            this.alphabets = ""
            this.$bvModal.show('modal-trans')
        },

        // To draw a transition between different states and open the alphabets prompt
        drawArcBetweenAreas(startCircle, endCircle) {
            let theta = Math.atan((startCircle.y - endCircle.y) / (endCircle.x - startCircle.x)) || 0;
            let thetaAdd = 0.523599; // 30 degrees extra so that the lines aren't all from the same point

            let startNewPoint = { x: null, y: null };
            let endNewPoint = { x: null, y: null };
            let controlPoint = { x: null, y: null };
            
            let BHeight = 0;
            let thetaComplement = 0;
            const arrowHead = 15;
            const arrowAngle = 0.3;

            this.canvasArea.beginPath();

            if (startCircle.x > endCircle.x) {
                // calculating new positions on the circumference of the circles
                startNewPoint.y = startCircle.y + Math.sin(theta + thetaAdd) * startCircle.radius;
                startNewPoint.x = startCircle.x - Math.cos(theta + thetaAdd) * startCircle.radius;
                endNewPoint.y = endCircle.y - Math.sin(theta - thetaAdd) * endCircle.radius;
                endNewPoint.x = endCircle.x + Math.cos(theta - thetaAdd) * endCircle.radius;

                // drawing the arcs between the circles
                this.canvasArea.moveTo(startNewPoint.x, startNewPoint.y);
                BHeight = 40;
                thetaComplement = 1.5708 - theta;
                controlPoint.x = (startNewPoint.x + endNewPoint.x) / 2 + Math.cos(thetaComplement) * BHeight
                controlPoint.y = (endNewPoint.y + startNewPoint.y) / 2 + Math.sin(thetaComplement) * BHeight 
                this.canvasArea.quadraticCurveTo(
                    controlPoint.x,
                    controlPoint.y,
                    endNewPoint.x, endNewPoint.y
                )

                const newEndTheta = theta - thetaAdd;
                const beta = arrowAngle - newEndTheta;

                this.canvasArea.moveTo(
                    endNewPoint.x + Math.cos(beta) * arrowHead,
                    endNewPoint.y + Math.sin(beta) * arrowHead
                )
                this.canvasArea.lineTo(endNewPoint.x, endNewPoint.y)
            } else {
                // calculating new positions of the circumference of the circles
                startNewPoint.y = startCircle.y - Math.sin(theta + thetaAdd) * startCircle.radius
                startNewPoint.x = startCircle.x + Math.cos(theta + thetaAdd) * startCircle.radius
                endNewPoint.y = endCircle.y + Math.sin(theta - thetaAdd) * endCircle.radius
                endNewPoint.x = endCircle.x - Math.cos(theta - thetaAdd) * endCircle.radius

                // drawing the arcs between the circles
                this.canvasArea.moveTo(startNewPoint.x, startNewPoint.y)
                BHeight = 40
                thetaComplement = 1.5708 - theta
                controlPoint.x = (startNewPoint.x + endNewPoint.x) / 2 - Math.cos(thetaComplement) * BHeight
                controlPoint.y = (endNewPoint.y + startNewPoint.y) / 2 - Math.sin(thetaComplement) * BHeight
                this.canvasArea.quadraticCurveTo(
                    controlPoint.x,
                    controlPoint.y,
                    endNewPoint.x, endNewPoint.y
                );

                const newEndTheta = theta - thetaAdd
                const beta = arrowAngle - newEndTheta

                this.canvasArea.moveTo(
                endNewPoint.x - Math.cos(beta) * arrowHead,
                endNewPoint.y - Math.sin(beta) * arrowHead
                );
                this.canvasArea.lineTo(endNewPoint.x, endNewPoint.y);
            }

            this.canvasArea.stroke();
            this.currentTransitionObject = {
                start: startNewPoint,
                end: endNewPoint,
                control: controlPoint,
            }

            this.alphabets = ""
            this.$bvModal.show('modal-trans')
        },

        // Utility function to find the nearest state from a click location within a certain threshold
        findNearestState(clientX, clientY) {
            if (this.stateMachine.length <= 0) {
                return null;
            }

            let nearestState = this.stateMachine.reduce(
                (smallestState, currentState) => {
                    let currentDist = Math.pow(currentState.graphicArea.x - clientX, 2) + Math.pow(currentState.graphicArea.y - clientY, 2);
                    let smallestDist = Math.pow(smallestState.graphicArea.x - clientX, 2) + Math.pow(smallestState.graphicArea.y - clientY, 2);
                    smallestState = currentDist < smallestDist ? currentState : smallestState;
                    return currentDist < smallestDist ? currentState : smallestState;
                }
            );

            if (Math.pow(nearestState.graphicArea.x - clientX, 2) + Math.pow(nearestState.graphicArea.y - clientY, 2) > nearestState.graphicArea.threshold) {
                return null;
            } else {
                return nearestState;
            }
        },

        // Submit for tansition prompt
        transitionStringEntered(){
            if(this.alphabets == null || this,this.alphabets == ""){
                return false
            }

            this.alphabets.split(",").forEach(letter => {
                this.lastDownState.transitions.push({
                    alphabet : (letter != "") ? letter.charAt(0) : "<", 
                    toState : this.currentToState.state
                })
            });

            // gotta write the transitions variables in the middle of the arc
            let t = 0.5
            let x = (Math.pow(1-t, 2) * this.currentTransitionObject.start.x) + (2 * (1-t) * t * this.currentTransitionObject.control.x) + (Math.pow(t,2) * this.currentTransitionObject.end.x)
            let y = (Math.pow(1-t, 2) * this.currentTransitionObject.start.y) + (2 * (1-t) * t * this.currentTransitionObject.control.y) + (Math.pow(t,2) * this.currentTransitionObject.end.y)
            
            this.canvasArea.font = "20px Arial";
            this.canvasArea.textAlign = "center"
            let text = this.alphabets.replace(/,\s*$/, ",<")
            text = text.split(',')
            text = text.map((alphabet) => {return alphabet.charAt(0)})
            text = text.join(",")
            const textWidth = this.canvasArea.measureText(text).width

            this.canvasArea.fillStyle = "#e7e7e7"
            this.canvasArea.fillRect(x - textWidth/2,y - 10, textWidth, 20)
            
            this.canvasArea.fillStyle = "grey"
            this.canvasArea.fillText(text, x,y + 5);

            this.currentToState = null
            this.lastDownState = null
            this.currentTransitionObject = null
        },

        // POST a test string to the server after a machine has been stored and a hash has been generated
        async modalStringEntered(){
            if(this.testString == "" ){
                this.$notify({
                    group: 'notifications',
                    title: 'Test string is empty',
                    type: 'warn',
                    text: 'What are you going to do with an empty string?'
                })
                return false
            }
            try{
                const response = await axios.post('http://localhost:3000/runMachine',{
                    body: {
                        hash: this.machineHash,
                        test: this.testString
                    }
                })
                
                console.log(response)
                this.accepted = response.data
                this.$bvModal.show("run-result")
            } catch(err){
                if(err.response){
                    this.$notify({
                        group: 'notifications',
                        title: 'Error processing your request',
                        type: 'error',
                        text:  err.response.data || "Sorry, there seems to be a problem with the server"
                    })
                } else if(err.request){
                    this.$notify({
                        group: 'notifications',
                        title: 'Connection error',
                        type: 'error',
                        text:  "Sorry, couldn't connect to the server. Make sure you are connected"
                    })
                } else {
                    this.$notify({
                        group: 'notifications',
                        title: 'Unknown error',
                        type: 'error',
                        text:  err.message
                    })
                }
            }
        },

        // POST the machine along with a machine name to the server
        async modalNameEntered(){
            if(this.machineName == "" || this.machineName == null){
                this.alertText = "'Nothing' is not really a name"
                this.$notify({
                    group: 'notifications',
                    title: 'Empty machine name',
                    type: 'warn',
                    text:  "'Nothing' is not really a name"
                })
                return false
            }

            try{
                const response = await axios.post('http://localhost:3000/newMachine',{
                    body: {
                        name: this.machineName,
                        machine: this.stateMachine    
                    }
                })
                this.machineHash = response.data
                this.$notify({
                    group: 'notifications',
                    title: 'Machine stored!',
                    type: 'success',
                    text:  "Your machine has been stored successfully on the server"
                })
            } catch(err){
                if(err.response){
                    this.$notify({
                        group: 'notifications',
                        title: 'Error processing your request',
                        type: 'error',
                        text:  err.response.data || "Sorry, there seems to be a problem with the server"
                    })
                } else if(err.request){
                    this.$notify({
                        group: 'notifications',
                        title: 'Connection error',
                        type: 'error',
                        text:  "Sorry, couldn't connect to the server. Make sure you are connected"
                    })
                } else {
                    this.$notify({
                        group: 'notifications',
                        title: 'Unknown error',
                        type: 'error',
                        text:  err.message
                    })
                }
            }
        },

        // Store machine button click event 
        storeMachine(){
            if(this.stateMachine.length <= 0){
                this.$notify({
                    group: 'notifications',
                    title: 'No machine to store',
                    type: 'warn',
                    text:  "You've got to create a machine first"
                })
                return false
            }

            this.$bvModal.show('modal-name')
        },

        // Run machine button click event
        runMachine(){
            if(this.stateMachine.length <= 0){
                this.$notify({
                    group: 'notifications',
                    title: 'No machine to run',
                    type: 'warn',
                    text:  "You've got to create a machine first, store it and then run it"
                })
                return false
            }

            if(this.machineHash == ""){
                this.$notify({
                    group: 'notifications',
                    title: 'Machine not stored on the server',
                    type: 'warn',
                    text:  "You haven't stored this machine on the server yet"
                })
                return false
            }

            this.testString = ""
            this.$bvModal.show('modal-string')
        }
    },

    mounted() {
        // Set up canvas and its dimensions
        this.can = document.getElementById("c");
        this.canvasArea = this.can.getContext("2d");
        this.workArea = document.getElementById("workArea");
        this.canvasHeight = this.workArea.offsetHeight - 50;
        this.canvasWidth = this.workArea.offsetWidth;

        // Register mouse event handlers
        this.can.addEventListener("mousedown", this.canvasDown);
        this.can.addEventListener("mouseup", this.canvasUp);
    },

    destroyed() {
        // Detach mouse event handlers
        this.can.removeEventListener("mousedown", this.canvasDown);
        this.can.removeEventListener("mouseup", this.canvasUp);
    },
}
</script>

<style lang="scss" scoped>
#bParkBase {
    height: 100%;
    display: flex;
    flex-direction: column;
}

#bParkTopBar {
    background-color: rgb(228, 228, 228);
    border-bottom: 0.5px solid rgb(216, 215, 215);

    #brandLogo {
        height: 50px;
        transition: all 0.6s;
    }

    #brandLogo:hover {
        height: 60px;
        transition: all 0.6s;
    }

    #toolBar {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
    }
}

#actionButtonGroup{
    margin-left: 15px;


    button{
        border: none;
        color: white;
        font-size: 15px;
        padding: 10px 15px;
    }

    #storeButton{
        background-color: $secondary-accent-dark;
        border-radius: 3px;
        transition: all 0.4s;
    }

    #storeButton:hover{
        background-color: $secondary-accent-darker;
        transition: all 0.4s;
    }

    #runButton{
        background-color: $primary-accent;
        border-radius: 3px;
        margin-left: 10px;
        transition: all 0.4s;
    }

    #runButton:hover{
        background-color: $primary-accent-dark;
        transition: all 0.4s;
    }
}

#workArea {
    flex: 100%;
    height: 1fr;
    background-image: radial-gradient(#818181 5%, $base-color-light 5%);
    background-position: 0 0;
    background-size: 40px 40px;
}


#run-modal-container{
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    padding: 10px 0;

    #run-text{
        font-family: 'Roboto', sans-serif;
        color: $dark-color-alt;
        font-size: 19px;
    }

    #run-icon-success{
        color:#488d7f;
        font-size: 50px;
        padding-bottom: 10px;
    }

    #run-icon-error{
        color:#d36c43;
        font-size: 40px;
        padding-bottom: 10px;
    }
}
</style>
