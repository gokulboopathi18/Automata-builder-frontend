<template>
    <div class="state">
        <div>{{state_id}}</div>
    </div> 
</template>

<script>
export default{
    name: "State",
    props: {
        state_id: {
            type: Number,
            default: 0
        },
    }
}
</script>

<style lang="scss" scoped>
.state{
    border: 4px solid $dark-color;
    border-radius: 50%;
    height: 50px;
    width: 50px;
    margin: 5px 10px;

    div{
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