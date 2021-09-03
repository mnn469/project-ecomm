module.exports = (sequelize, DataTypes)=>{
    const specs = sequelize.define("specs", {
        // id: {
        //     type: DataTypes.INTEGER,
        //     allowNull : false,
        //     primaryKey : true
        // },
        name: {
            type: DataTypes.TEXT,
            allowNull : false
        },
        value: {
            type: DataTypes.TEXT,
            allowNull : false
        },
        
        
        
    });

    specs.associate = function(models){
        specs.belongsTo(models.prod, {
            foreignKey: "productId"
        })

    }

    return specs
}
    
