module.exports = (sequelize, DataTypes)=>{
    const cart = sequelize.define("cart", {
        // cartId: {
        //     type: DataTypes.INTEGER,
        //     allowNull : false,
        //     primaryKey : true
        // },
        flag: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        qty: {
            type:DataTypes.INTEGER,
            
        }
        
    
    })

    cart.associate = function(models){
        cart.belongsTo(models.prod, {
            foreignKey: "productId"
        })

    }



    return cart
}

