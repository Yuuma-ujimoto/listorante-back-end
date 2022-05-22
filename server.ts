import express,{Application} from "express"
import cors from "cors"
const app:Application = express()
const PORT:number = 3000

app.use(cors({
    origin:"http://localhost:8080",
    optionsSuccessStatus:200
}))

app.use(express.urlencoded({extended:true}))
app.use(express.json())

import shopRouter from "./routes/shop"
import tagRouter from "./routes/tag"

app.use("/shop",shopRouter)
app.use("/tag",tagRouter)

app.listen(PORT,()=>{
    console.log("http://localhost:"+PORT.toString())
})
