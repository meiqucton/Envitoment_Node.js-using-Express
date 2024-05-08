
const { NUMBER } = require('sequelize');
const client = require('../config/Mongoo_DB');
const { ObjectId } = require('mongodb');


const AddBook = async(NewBooks) =>  {
  
    const NewsBook = await client.db("Library").collection("Books").insertOne(NewBooks);
    return NewsBook.insertedId;

}
const Del_book = async(Book_id) =>{
  const result = await client.db("Library").collection("Books").deleteOne({ _id: new ObjectId(Book_id) });
  return result.deletedCount > 0;
}
const Find_Book = async(Book_title) => {
  return await client.db("Library").collection("Books").findOne({ BookTitle: Book_title });
}
const Update_Book = async(Book_id, UpdatedFields) => {
  try{
    const result = await client.db("Library").collection("Books").updateOne({ _id: new ObjectId(Book_id) }, {$set: UpdatedFields});
    return result.modifiedCount > 0;
  }catch(err){
    
    console.log(err);
  }
}
const Get_id = async (Book_id) => {
  return await client.db("Library").collection("Books").findOne({ _id: new ObjectId(Book_id) });
}
const List_Book = async() => {
    try{
    const books = await client.db("Library").collection("Books").find().toArray();
    return books;
    }
    catch(err){
      console.log(err);
    }
}




module.exports ={
  AddBook,
  Del_book,
  Find_Book,
  Update_Book,
  Get_id,
  List_Book,
}
