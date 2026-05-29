<template>
     <div class="order-container d-flex align-items-center flex-column gap-2">
            <div class="card d-flex align-items-center ">
                <div class="h-100 d-flex flex-row align-items-center gap-4">
                    <button class="button-order btn">
                        teste
                    </button>
                    <div class="d-flex flex-column">
                        <p>receita</p>
                        <h1>9,20</h1>
                    </div>
                    <button class="button-order btn">
                        teste
                    </button>
                </div>
            </div>
            <button v-for="button in buttons" 
                class="btn btn-no-borders"
                :key="button.field" 
                @click="button.action?.()" 
                :class="button.class"
                >
                    {{ button.name }}
            </button>
        </div>
</template>

<script setup>
const buttons = [
    {name: "Buy", class: "purchaseOrder", field: "purchaseOrder", action: purchaseOrder},
    {name: "Sell", class: "sellOrder", field: "sellOrder", action: sellOrder}
]

function purchaseOrder(){
    console.log("teste")
}

function sellOrder(){
    console.log("teste")
}
</script>

<style lang="scss">
.order-container{
    .card{
        width: 100%;
        height: 80px;
        border-color: var(--button-order-buy);
        background: transparent;
    }
    .purchaseOrder{
        width: 100%;
        height: 80px;
        background: var(--button-order-buy);
        color: var(--text-color);
    }
    .sellOrder{
        width: 100%;
        height: 80px;
        background:var(--button-order-sell);
        color: var(--text-color);
    }
    .button-order{
        background-color: var(--button-order-buy);
        border: 1px solid var(--button-order-buy);
        border-radius: 100px;
    }
}

</style>