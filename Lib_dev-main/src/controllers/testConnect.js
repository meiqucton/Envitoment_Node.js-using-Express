const client = require('../config/Mongoo_DB');
const PayPal = require('../config/Paypal(bank)');

    const TestMongoo = async(req,res) =>{
        try{
            await client.connect();
            await client.db("admin").command({ ping: 1 });
            console.log("Kết nối Mongoodb thành công!");
        }
        catch(err){
            console.log("Lỗi kết nối  Mongoodb", err);
        }
    }

module.exports ={ TestMongoo } ;
