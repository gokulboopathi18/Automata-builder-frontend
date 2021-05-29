<template>
    <div id="_404">
        <div id="_404Group">
            <h5>Yeah, sorry that's not a real thing</h5>
            <router-link to="/">
                <b-button size="sm">Back Home</b-button>
            </router-link>
        </div>
    </div> 
</template>

<script>
export default{
    name: "_404",
}
</script>

<style lang="scss" scoped>
#_404{
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;

    #_404Group{
        h5{
            padding-bottom: 5px;
        }
    }
}

</style>