const express = require('express')
const router = express.Router()
const db = require('../models')
const prod = require('../models/prod')
const category = require('../models/category')
const brand = require('../models/brand')
const specs = require('../models/specs')
const cart = require('../models/cart')
const orders = require('../models/orders')
const order_items = require('../models/order_items')
const { Op } = require('sequelize')

// calls for category
router.get("/category/", (req, res)=>{
    db.category.findAll().then(category => res.send(category))

})

router.get('/category/:id', (req, res)=>{
    console.log('hello')
    db.category.findAll({
        where: {
            id: req.params.id
        }
    }).then(category => res.send(category))
})

router.post('/category', (req, res)=>{
    db.category.create({
        // cId: req.body.cId,
        title: req.body.title,
        


    }).then(submitedCategory => res.send(submitedCategory))
})

router.delete('/delete/:id', (req, res)=>{
    db.category.destroy({
        where:{
            id: req.params.id
        }
    }).then(() => res.send('success'))
})

//calls for prod
router.get("/products/", async(req, res)=>{
    
    const catId = req.query.catId;
    const brId = req.query.brId;
    const stri = req.query.stri;

    const searchQuery = {
        $like : Op.like
    }
    const filter = {
        where: {},
        include: [{
            model: db.brand,
        }, {
            model : db.category,
        }, {
            model : db.specs,
        }],
    };
    if (catId) {
        filter.where.categoryId = catId;
    }
    if (brId) {
        filter.where.brandId = brId;
    }
    if (req.query.stri) {
        filter.where = {
            [Op.or] : [
                {title: {[Op.iLike]: `%${stri}%`}},
                {'$brand.name$' : {[Op.iLike]: `%${stri}%`}}
            ]
        }
    }
    console.log(filter);
    let list = await db.prod.findAll(filter);
    res.send(list);  
})
router.get('/products/:id', (req, res)=>{
    console.log('hello')
    db.prod.findOne({
        where: {
            id: req.params.id
        },
            include : [{
                model : db.category,
            }, {
                model : db.brand,
            }, {
                model : db.specs,
            }]
        
    }).then(prod => res.send(prod))
})
router.post('/products', async(req, res)=>{
    const brand_data = await db.brand.findOne({
        where: {id : req.body.brandId}
    });
    const cat_data = await db.category.findOne({
        where : {id : req.body.categoryId}
    });
    if(!cat_data && !brand_data){
        res.send("check category and brand")
    }
    else if(!cat_data){
        res.send("Please check the category.")
    }
    else if(!brand_data){
        res.send("Please check the brand.")
    }
    else{
        const prod_details = await db.prod.create({
            // pId: req.body.pId,
            title: req.body.title,
            price: req.body.price,
            ratings: req.body.ratings,
            brandId: req.body.brandId,
            categoryId: req.body.categoryId
        })
        const array = []; 
    req.body.spec.forEach((element, index)=> {
        array.push({
            name : element.name,
            value : element.value,
            productId : prod_details.id
        })

     })
    const spec_data = await db.specs.bulkCreate(array, {returning : true})
    res.send(prod_details)
    }  
})

router.put('/product/:id', async (req, res)=>{
    const ProdU = await db.prod.update({
        categoryId: req.body.categoryId,
        brandId: req.body.brandId
    }, {
        where: {
            id: req.params.id
        }
    })

    const Spec_data = await db.specs.findAll({
            where : {productId : req.params.id}
    })
  

    var flag = 0;
    const arr1 = []
    const arr2 = []
    const arr3 = []

    req.body.spec.forEach((element, index) =>{
        Spec_data.forEach((elt, idx) =>{
            if(element.id === elt.id){
                flag = 1;
            }
            
        })
        if(flag === 1 && element.method === "update"){
            arr1.push({
                specId: element.id,
                name : element.name,
                value : element.value,
                productId : req.params.id
            })

        }
        else if(element.method === "update" && flag === 0){
            arr2.push({
                name : element.name,
                value : element.value,
                productId : req.params.id
            })
        }
        else if (element.method === "delete" && flag === 1){
            arr3.push({
                specId : element.id,
                name : element.name,
                value : element.value,
                productId : req.params.id
            })

        }
    })

    await db.specs.bulkCreate(arr2, {returning : true})

    for(let i = 0; i < arr1.length; i++){
        await db.specs.update({
                    name : arr1[i].name,
                    value: arr1[i].value,
                    productId : req.params.id
                }, {
                    where : {id : arr1[i].specId}
                })
                

    }

    for(let j = 0; j < arr3.length; j++){
        await db.specs.destroy({
                    where : {id : arr3[j].specId}
                })
                

    }




    const data = await db.prod.findOne({
        where : {id : req.params.id},
        include : [{
            model : db.brand,
    }, {
            model : db.category,
    }, {
            model : db.specs,
    }]
})

    res.send(data)
})

router.delete('/delete/products/:id', (req, res)=>{
    db.prod.destroy({
        where:{
            id: req.params.id
        }
    }).then(() => res.send('success'))
})

//brand calls
router.get("/brand/", (req, res)=>{
    db.brand.findAll().then(brand => res.send(brand))

})

router.get('/brand/:id', (req, res)=>{
    console.log('hello')
    db.brand.findAll({
        where: {
            id: req.params.id
        }
    }).then(brand => res.send(brand))
})

router.post('/brand', (req, res)=>{
    db.brand.create({
        // bId: req.body.bId,
        name: req.body.name,
        


    }).then(submitedBrand => res.send(submitedBrand))
})
router.delete('/delete/brand/:id', (req, res)=>{
    db.brand.destroy({
        where:{
            id: req.params.id
        }
    }).then(() => res.send('success'))
})

router.get("/cart/", (req, res)=>{
    db.cart.findAll({
        where : {flag : 1},
        include: [{
            model : db.prod,
        
        

        }]
    }).then(cart => res.send(cart))

})


router.get("/cart/:cartId", (req, res)=>{
    db.cart.findAll({
        where:{
            id: req.params.id,
            flag : 1
            
        },
        include: [{
            model : db.prod,

        }]  
        
    }).then(cart => res.send(cart))

})



router.post('/cart', async (req, res)=>{
    const prod_det = await db.prod.findOne({
        where : {id : req.body.productId}
    })

    if(!prod_det){
        res.send("Product does not exist")
    }
    else{
        const cart_details = await db.cart.findOne({
            where: {flag : 1,
            productId: req.body.productId}
        })
        
    
        if(!cart_details){
            const created_details = await db.cart.create({
                // cartId: req.body.cartId,
                qty: req.body.qty,
                productId: req.body.productId
            })
            res.send(created_details)
        }
        else{
            const updated_details = await db.cart.update({
                qty: cart_details.qty + req.body.qty,
            },{
            where : {id : cart_details.id},
            })
            res.send(updated_details)
        }

    }

    
    

})

router.delete('/delete/cart/:id', (req, res)=>{
        db.cart.destroy({
            where:{
                id: req.params.id
            }
        }).then(() => res.send('success'))
    })

//calls for orders

router.post('/checkout/', async (req, res)=>{
    const cart_data = await db.cart.findAll({
        where : {flag : 1},
        include: [{
            model : db.prod,

        }]  
    });
    if(cart_data.length === 0){
        res.send("cart is empty")
    }
    else{
        console.log(JSON.parse(JSON.stringify(cart_data)))
    const cartJSON = JSON.parse(JSON.stringify(cart_data));
    var amount = 0;
    var quantity = 0;
    cartJSON.forEach((element, index) => {
        amount = amount + element.prod.price*element.qty;
        
        
        

        
    });
    
    const order =   await db.orders.create({
        // cartId: req.body.cartId,
        amt: amount,

    })
    const arrr = []
    cartJSON.forEach((element, index) => {
        arrr.push({
            // oiId: index + 1,
            // qty: element.qty,
            
            productId: element.productId,
            orderId: order.id,
            qty : element.qty
            
        }) 
    })
    await db.cart.update({
        flag : 0,},
        {where : {},
        })

    const order_i = await db.order_items.bulkCreate(arrr, {returning: true})
    console.log(order_i)
    const order_d = await db.orders.findAll({
        where : {id : order.id},
        include : [{
            model : db.order_items,
            include :[{
                model : db.prod,
                include : [{
                    model : db.specs,
                }]
            }]
        }]
    })

    res.send(order_d);


    }       
})

router.get("/orders/", async(req, res)=>{
    const order_dat = await db.orders.findAll({
        where:{},
         
        
    })

    res.send(order_dat)

})

router.get("/order_items/", async(req, res)=>{
    const order_it_dat = await db.order_items.findAll({
        where:{},
    })

    res.send(order_it_dat)

})


module.exports = router