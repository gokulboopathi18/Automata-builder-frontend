<template>
    <div class="state">
        <div>F</div>
    </div> 
</template>

<script>
export default{
    name: "StartState",
}
</script>

<style lang="scss" scoped>
.state{
    border: 4px solid $dark-color;
    border-radius: 50%;
    height: 50px;
    width: 50px;
    margin: 5px 5px;

    div{
        border: 2px solid $dark-color-alt;
        border-radius: 50%;
        color: $dark-color;
        font-size: 20px;
        height: 100%;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>