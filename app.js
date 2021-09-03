

const express = require("express");
const bodyParser = require("body-parser");

const mongoose=require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
// connect vao db
mongoose.connect("mongodb+srv://admin:1234@cluster0.bc0lr.mongodb.net/todolistDB",{useNewUrlParser:true, useUnifiedTopology: true});
const itemSchema={
  name:String

};
const Item=mongoose.model("Item",itemSchema);
const item1=new Item({
  name:"welcome to my todolist"
});
const item2=new Item({
  name:"hello world"
});
const item3=new Item({
  name:"nice to meet ya"
});

const defaultItems=[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemSchema]
}
const List=mongoose.model("List",listSchema);
 
app.get("/", function(req, res) {

  
  Item.find({},(err,docs)=>{

      if(docs.length===0){
        Item.insertMany(defaultItems,(err)=>{
          if(err){
            console.log(err);
          }
          else{
            console.log("success");
          }
        
        });
        res.redirect("/");
      }
    else
      res.render("list", {listTitle: "Today", newListItems: docs});
  
  });

  

});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const listName=req.body.listName;
  console.log(listName);
  const inserItem=new Item(
    {
      name:item
    }
  );
  if(listName==="Today"){
    inserItem.save();
    res.redirect("/");
  }
  else{
    List.find({name:listName},(err,docs)=>{
     
      if(err)
        console.log(err);
      else{
        
        docs[0].items.push(inserItem);
        docs[0].save();
      }
        

    });
    res.redirect(`/${listName}`);
  }
 
 
});
app.post("/delete",(req,resp)=>{
  const id=req.body.checkbox
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.deleteOne({_id:id},(err)=>{
      if(err)
        console.log("there some err");
      else
        console.log("remove success");
  });
  resp.redirect("/");
  }
  else{
    
   List.find({name:listName},(err,docs)=>{
     let arrItems=docs[0].items;
      
      arrItems.map((item)=>{
          if(item._id==id)
              console.log(item);
            
      })

   });
    resp.redirect(`/${listName}`);
  }
    
})
app.get("/:customListName",(req,resp)=>{
  const customListName= req.params.customListName;
  
  List.findOne({name:customListName},(err,docs)=>{
      if(!err){
        if(!docs){
          const list=new List({
            name:customListName,
            items:defaultItems
          });
         
          list.save();
         resp.redirect(`/${customListName}`)
          
        }
        else
            List.find({name:customListName},(err,docs)=>{
              if(err)
                console.log(err);
              else{
               
                  resp.render("list",{listTitle:customListName,newListItems:docs[0].items});
              }
        
          })
      }
     
  });
 
 
 



})


let port= process.env.PORT;
if(port==null||port==""){
  port=3000;


}


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(port, function() {
  console.log("Server started on port 3000");
});

