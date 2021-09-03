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

// calls for category
router.get("/category/all", (req, res)=>{
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

router.post('/category/new', (req, res)=>{
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
router.get("/products/All", (req, res)=>{
    db.prod.findAll({
        include: [{
            model : db.brand,
            // model : db.category,
        
        

        }, {
            model : db.category,

        }, {
            model : db.specs,
        }]
    }).then(prod => res.send(prod))

})
router.get('/products/:id', (req, res)=>{
    console.log('hello')
    db.prod.findAll({
        where: {
            id: req.params.id
        }
    }).then(prod => res.send(prod))
})
router.post('/products/new', async(req, res)=>{
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



        


    // }).then(submitedProd => res.send(submitedProd))
})
router.delete('/delete/products/:id', (req, res)=>{
    db.prod.destroy({
        where:{
            id: req.params.id
        }
    }).then(() => res.send('success'))
})

//brand calls
router.get("/brand/all", (req, res)=>{
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

router.post('/brand/new', (req, res)=>{
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


//calls for specs
router.get("/specs/all", (req, res)=>{
    db.specs.findAll().then(specs => res.send(specs))

})

router.get('/specs/:id', (req, res)=>{
    console.log('hello')
    db.specs.findAll({
        where: {
            id: req.params.id
        }
    }).then(specs => res.send(specs))
})

router.post('/specs/new', (req, res)=>{
    db.specs.create({
        // id: req.body.id,
        name: req.body.name,
        value: req.body.value,
        productId: req.body.productId
        


    }).then(submitedSpecs => res.send(submitedSpecs))
})
router.delete('/delete/specs/:id', (req, res)=>{
    db.specs.destroy({
        where:{
            id: req.params.id
        }
    }).then(() => res.send('success'))
})

//calls for cart

router.get("/cart/all", (req, res)=>{
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



router.post('/cart/new', async (req, res)=>{
    const cart_details = await db.cart.findOne({
        where: {flag : 1,
        productId: req.body.productId}
    })
    console.log(cart_details)

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
    
    

})

router.delete('/delete/cart/:id', (req, res)=>{
        db.cart.destroy({
            where:{
                id: req.params.id
            }
        }).then(() => res.send('success'))
    })

//calls for orders

router.post('/checkout', async (req, res)=>{
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
    



    // }).then(submitedOrders => res.send(submitedOrders))
    // // function myFunction(item, arr){
    // // }
    // console.log(arr[1])
    
    
})

// router.get("/orders/all", (req, res)=>{
//     db.orders.findAll().then(orders => res.send(orders))

// })

// router.delete('/delete/orders/:id', (req, res)=>{
//     db.orders.destroy({
//         where:{
//             id: req.params.id
//         }
//     }).then(() => res.send('success'))
// })

// //calls for order items


// // router.post('/buyNow', async (req, res)=>{
// //     const cart_datas = await db.cart.findAll({
// //         where :{
// //             flag:1
// //         }
// //     });

// //     console.log(JSON.parse(JSON.stringify(cart_datas)))

// //     const cartsJSON = JSON.parse(JSON.stringify(cart_datas));
// //     const arrr = [];
// // cartsJSON.forEach((element, index) => {
// //         arrr.push({
// //             // oiId: index + 1,
// //             // qty: element.qty,
            
// //             pId: element.productId,
            
// //         })
// //     });
        
// //     await db.order_items.bulkCreate(arrr, {returning: true})
// // })

// router.get("/order_items/all", (req, res)=>{
//     db.order_items.findAll({
        
//         include: [{
//             model : db.prod,
            
        
        

//         }, {
//             model : db.orders,

//         }],
        
        
//     }).then(order_items => res.send(order_items))

// })

// router.delete('/delete/order_items/:id', (req, res)=>{
//     db.order_items.destroy({
//         where:{
//             id: req.params.id
//         }
//     }).then(() => res.send('success'))
// })








// router.put('/edit/:id', (req, res)=>{
//     console.log(req.params)
//     db.prod.update({
//         title: req.body.title,
//         price: req.body.price,
//         ratings: req.body.ratings,
//         categoryId: req.body.categoryId,
//         brandId: req.body.brandId
//     }, {
//         where: {
//             id: req.params.id
//         }
//     }).then(()=> res.send('success'))
// })
module.exports = router