module.exports = (sequelize, DataTypes)=>{
    const category = sequelize.define("category", {
        // cId: {
        //     type: DataTypes.INTEGER,
        //     primaryKey : true,
        //     allowNull: false
        // },
        title: {
            type: DataTypes.TEXT,
            allowNull : false
        },

    });

    category.associate = function(models){
        category.hasMany(models.prod), {
            foreignKey: "productId"
                }
    }
    return category;



}

    

