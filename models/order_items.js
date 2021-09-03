module.exports = (sequelize, DataTypes)=>{
    const order_items = sequelize.define("order_items", {
        // oiId: {
        //     type: DataTypes.INTEGER,
        //     allowNull : false,
        //     primaryKey : true
        // },
        qty: {
            type: DataTypes.INTEGER,
            allowNull : false
        },
        // amt: {
        //     type: DataTypes.INTEGER,
        //     allowNull: false
        // },
        
    
    })

    order_items.associate = function(models){
        order_items.belongsTo(models.prod, {
            foreignKey: "productId"
        });
        order_items.belongsTo(models.orders, {
            foreignKey: "orderId"
        })

    }
    // order_items.associate = function(models){
    //     order_items.belongsTo(models.orders, {
    //         foreignKey: {
    //             name : "id"
    //         }
    //     })

    // }

    return order_items
}
