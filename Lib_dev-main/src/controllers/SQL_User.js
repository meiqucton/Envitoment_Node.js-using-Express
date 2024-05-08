
const AccountModel = require('../model/SQL_User');



const SiginCtr = async (req, res) => {
  const { Gmail, password } = req.body;   
  // req.body: dùng dể truy câpj thông tin từ máy chủ đến máy khách 

  if (Gmail && password) {
    try {
      const user = await AccountModel.Signinlog(Gmail, password);

      if (user) {
        req.session.loggedin = true;
        req.session.Gmail = Gmail;
        res.redirect('/Home');
      } else {
        res.send('Email and Password is incorrect');
     
       // alert('Email or password is incorrect');
      }
    } catch (error) {

      res.status(500).send('Lỗi máy chủ nội bộ');
      process.emit('error', error);
    }
  } else {
      res.send('Vui lòng nhập Tên đăng nhập và Mật khẩu!');
     // alert('please enter your email address and password');
  }
};

const SigupCtr = async (req, res) => {
  const { UserName, password, Gmail, BirthDay, Phone } = req.body;
  
  if (UserName && password && Gmail &&  BirthDay && Phone ) {
    try {
      const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      const PhoneNum = /^[0-9_]$/;

      const isExist = await AccountModel.checkGmail(Gmail);
      const currentDate = new Date();
      const dateOfBirthDay = new Date(BirthDay);
      const age = currentDate.getFullYear() - dateOfBirthDay.getFullYear();

      if (age < 18) {
        res.send('Your age should be 18+');
      } 
      else if (!mailformat.test(Gmail)) {
        res.send('Gmail không đúng định dạng!');
      }
      else if(PhoneNum < 10 || PhoneNum > 10){
        res.send('Số điện thoại không đúng định dạng!');
      }
      else if(isExist){
        res.send(`Gmail ${Gmail} đã tồn tại !`);
      }
      else if (password.length < 6) {
        res.send('Mật khẩu phải có ít nhất 6 ký tự!');
      }
      else{
        await AccountModel.Signuplog( UserName, password, Gmail, BirthDay, Phone );
        res.send('Đăng ký thành công!');
      } 
    } catch (error) {
      console.error('Lỗi trong quá trình đăng ký:', error);
      res.status(500).send('Lỗi máy chủ nội bộ');
    }
  } else {
    res.send('Vui lòng nhập Tên đăng nhập, Mật khẩu, và Gmail!');
  }
};
const GetCustomById = async(req, res) => {
  const EditCus = req.params.CustomId;

try{
  const GetUsers = await AccountModel.GetCustom(EditCus);

  
  res.render('Edit', {GetUser: GetUsers});
}catch(err){
  console.log(err);
  res.status(500).send('Lỗi máy chủ nội bộ');
  }
}; 
const GetCustomById_Del = async(req, res) => {
  const DelCus = req.params.CustomId;

try{
  const GetUsers = await AccountModel.GetCustom(DelCus);
  res.render('DeleteCustom', {GetUser: GetUsers});
}catch(err){
  console.log(err);
  res.status(500).send('Lỗi máy chủ nội bộ');
  }
}; 
const Update_custom = async (req, res) => {
  try {
    let UserName = req.body.UserName;
    let Gmail = req.body.Gmail;
    let BirthDay = req.body.BirthDay;
    let Phone = req.body.Phone; // 
    let CustomId = req.body.CustomId;

    let Update_cus= await AccountModel.Update_cus(UserName, Gmail, BirthDay, Phone, CustomId);
    if(Update_cus){
      console.log("Update_cus");
    res.redirect('/Cus_Show');  
    }else{
      res.status(500).send('Update người dùng thất  bại');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('Lỗi máy chủ nội bộ');
    console.log('SHoww err', err);
  }
};
const Del_Cusotm = async (req,res) => {
  try{
    const DelId = req.params.CustomId; 
    const Del_cus = await AccountModel.Delete_cus(DelId);
    if(Del_cus){
      console.log("Del_cus");
      res.redirect('/Cus_Show');
    }
    else{
      res.status(404).send('Không tìm thấy người dùng'); 
    }
  }
  catch(err){
    console.log(err);
    res.status(500).send('Lỗi máy chủ nội bộ');
    console.log('SHoww err', err);
  }
};
const Find_cus = async (req,res) => {
  const {CustomId} = req.query;
  try{
    const results = await AccountModel.Find_cus(CustomId);
    if (results && results.length > 0) {
      res.render('Find_cus', { results: results });
    } else {
      res.render('Find_cus', { results: [] }); // Pass an empty array if no results found
      console.log("Customer: ", results);
    }
  }catch(err){
    console.log(err);
    res.status(500).send('Lỗi máy chủ nội bộ');
    console.log('SHoww err', err);
  }
};
// const Your_profile = async (req, res) => {
//   const { CustomId } = req.params;

//   try {
//     const profile = await AccountModel.Your_profile(CustomId);

    

//     res.render('Your_profile', { profile });
//     console.log('Thông tin hồ sơ:', profile);
//   } catch (error) {
//     console.error('Lỗi khi truy xuất thông tin hồ sơ:', error);
//     res.status(500).send('Lỗi máy chủ nội bộ');
//   }
// };




module.exports = { SiginCtr, SigupCtr, GetCustomById, Update_custom, Del_Cusotm, GetCustomById_Del, Find_cus, };
