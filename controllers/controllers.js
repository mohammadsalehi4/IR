const Doc=require('../model/document')
const Index=require('../model/indexed')
const lucene = require('lucene');
const { removeStopwords } = require('stopword')
const natural =require('natural')

module.exports.addToDoc=(req,res)=>{
    const getText = req.body.text
    const splitString = getText.split(" ");
    const newString = removeStopwords(splitString)
    const newArr=[]

    const indexer=(getArray,id)=>{
        for(let i=0;i<getArray.length;i++){
            Index.find({word:getArray[i]})
            .then(result=>{
                if(result.length===0){
                    const index=new Index({
                        word:getArray[i],
                        address:[id]
                    })
                    index.save()
                }else{
                    let GWord=result[0].address
                    GWord.push(id)
                    result[0].address=GWord
                    result[0].save()
                }
            })
        }
        return res.status(200).json({
            msg:'added'
        })
    }

    for(let i=0;i<newString.length;i++){
        newArr.push(natural.PorterStemmer.stem(newString[i]))
    }
    const doc=new Doc({
        Main_text:getText
    })
    doc.save()
    .then(result=>{
        Doc.find()
        .then(resp=>{
            const id=resp[resp.length-1]._id
            indexer(newArr,id)
        })
    })
    .catch(err=>{
        return res.status(200).json({
            err:err
        })
    })
}

module.exports.search=(req,res)=>{
    const getText = req.body.text
    const splitString = getText.split(" ");
    const newString = removeStopwords(splitString)
    let newArr=[]
    for(let i=0;i<newString.length;i++){
        newArr.push(natural.PorterStemmer.stem(newString[i]))
    }

    const lastArr=newArr
    newArr=[]

    for(let i=0;i<lastArr.length;i++){
        if(lastArr[i]!=[]){
            newArr.push(lastArr[i])
        }
    }

    const adder=(getAddress)=>{

        const getResult=[]
        if(getAddress.length>0){
            for(let i=0;i<getAddress.length;i++){
                Doc.findById(getAddress[i])
                .then(rslt=>{
                    getResult.push({
                        Document_id:getAddress[i],
                        content:rslt.Main_text
                    })
                    if(i===getAddress.length-1){
                        return res.status(200).json({
                            msg:getResult
                        })
                    }
                })
            }
        }else{
            return res.status(200).json({
                msg:'result not founded'
            })
        }

    }

    const getAddress=[]

    for(let i=0;i<newArr.length;i++){
        let v=0
        Index.find({word:newArr[i]})
        .then(result=>{
            if(result.length>0){
                checker=true
                for(let j=0;j<result[0].address.length;j++){
                    getAddress.push(result[0].address[j])
                }
                if(i===newArr.length-1){
                    adder(getAddress)
                }
                
            }else{
                if(i===newArr.length-1){
                    adder(getAddress)
                }
            }
        })
        .catch(err=>{
            return res.status(200).json({
                msg:err
            })
        })
    }
}