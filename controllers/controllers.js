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

    const cosinoser=(doc)=>{
        const splitString = doc.split(" ");
        const newString = removeStopwords(splitString)
        let newArr1=[]
        let indexed=[]
        for(let i=0;i<newString.length;i++){
            newArr1.push(natural.PorterStemmer.stem(newString[i]))
        }
    
        const lastArr=newArr1
        newArr1=[]
    
        for(let i=0;i<lastArr.length;i++){
            if(lastArr[i]!=[]){
                newArr1.push(lastArr[i])
            }
        }

        indexed.push({
            indexes:newArr1[0],
            document:1,
            question:0

        })

        for(let i=1;i<newArr1.length;i++){
            let checker=false
            for(let j=0;j<indexed.length;j++){
                if(indexed[j].indexes===newArr1[i]){
                    checker=true
                    indexed[j].document++
                }
            }
            if(!checker){
                indexed.push(
                    {
                        indexes:newArr1[i],
                        document:1,
                        question:0
                    }
                )
            }
        }

        for(let i=0;i<newArr.length;i++){
            let checker=false
            for(let j=0;j<indexed.length;j++){
                if(indexed[j].indexes===newArr[i]){
                    checker=true
                    indexed[j].question++
                }
            }
            if(!checker){
                indexed.push(
                    {
                        indexes:newArr[i],
                        document:0,
                        question:1
                    }
                )
            }
        }
        let docValue=0
        let qValue=0
        for(let i=0;i<indexed.length;i++){
            docValue=docValue+(indexed[i].document*indexed[i].document)
            qValue=qValue+(indexed[i].question*indexed[i].question)
        }
        docValue= Math.sqrt(docValue)
        qValue=Math.sqrt(qValue)

        const allValue=docValue*qValue

        let sum=0
        for(let i=0;i<indexed.length;i++){
            sum=sum+(indexed[i].document*indexed[i].question)
        }

        const lastValue=sum/allValue

        return lastValue
    }

    const cosinos=(lastArray)=>{
        const deg=[]
        for(let i=0;i<lastArray.length;i++){
            deg.push(cosinoser(lastArray[i].content))
        }

        const lastValue=[]

        for(let i=0;i<lastArray.length;i++){
            lastValue.push({
                content:lastArray[i].content,
                id:lastArray[i].Document_id,
                cosinos:deg[i]
            })
        }

        const notsortedValue=[]
        notsortedValue.push(lastValue[0])

        for(let i=1;i<lastValue.length;i++){
            let checker=false
            for(let j=0;j<notsortedValue.length;j++){
                if(notsortedValue[j].id===lastValue[i].id){checker=true}
            }
            if(!checker){notsortedValue.push(lastValue[i])}
        }

        for(let i=0;i<notsortedValue.length;i++){
            let a=notsortedValue[i]
            let b=i
            let c=notsortedValue[i].cosinos
            for(let j=i;j<notsortedValue.length;j++){
                if(notsortedValue[j].cosinos>c){
                    a=notsortedValue[j]
                    b=j
                    c=notsortedValue[j].cosinos
                }
            }
            notsortedValue[b]=notsortedValue[i]
            notsortedValue[i]=a
        }

        return res.status(200).json({
            result:notsortedValue
        })
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
                        cosinos(getResult)
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