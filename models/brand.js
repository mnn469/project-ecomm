module.exports = (sequelize, DataTypes)=>{
    const brand = sequelize.define("brand", {
        // bId: {
        //     type: DataTypes.INTEGER,
        //     allowNull : false,
        //     primaryKey : true
        // },
        name: {
            type: DataTypes.TEXT,
            allowNull : false
        },
        
    
    })


    brand.associate = function(models){
        brand.hasMany(models.prod), {
            foreignKey: {
                name : "brandId"
            }
        }
    }
    return brand
}