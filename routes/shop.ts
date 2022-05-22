import {Router,Request,Response} from "express";
import {
    BaseApiResponse,
    CreateShopResponse,
    EditDataRequestBody, SelectShopListRequest,
    SelectShopListResponse,
    SelectShopStatusResponse,
    SQL
} from "../Types"
import {Connection, createConnection} from "mysql2/promise";
import {mysqlSetting} from "../settings/mysql";


const router:Router = Router()

router.post("/create",async (req:Request, res:Response) => {
    const connection:Connection = await createConnection(mysqlSetting)
    try {
        const CreateShopSQL:SQL = "insert into shops() values()"
        const [CreateShopResult,]:any = await connection.query(CreateShopSQL)
        const ShopId:number = CreateShopResult.insertId
        const responseBody:CreateShopResponse = {
            ServerError:false,
            ClientError:false,
            ShopId:ShopId
        }
        res.json(responseBody)
        return
    }
    catch (error){
        console.log(error)
        const responseBody:CreateShopResponse={
            ServerError:true,
            ClientError:false,
            ErrorMessage:"データベースエラー"
        }
        res.json(responseBody)
    }
    finally {
        await connection.end()
    }
})

router.get("/list",async (req:Request,res:Response)=>{
    const {page=1}:SelectShopListRequest = req.query
    if (!page||page<1){
        const responseBody:SelectShopListResponse={
            ServerError:false,
            ClientError:true,
            ErrorMessage:"必要な情報が足りません。"
        }
        res.json(responseBody)
    }
    const offset:number = (page-1)*10
    const connection:Connection = await createConnection(mysqlSetting)
    try {
        const SelectShopListSQL:SQL = "select shop_id,shop_name from shops where is_deleted = 0 order by updated_at desc limit 10 offset  ?"
        const [SelectShopListResult,]:any = await connection.query(SelectShopListSQL,[page])

        console.log(SelectShopListResult)



        const SelectMaxPageSQL = "select count(*) as count from shops where is_deleted = 0"
        const [SelectMaxPageResult,]:any = await connection.query(SelectMaxPageSQL)

        const maxPage = Math.floor(SelectMaxPageResult[0].count / 10) + 1

        const responseBody:SelectShopListResponse = {
            ServerError:false,
            ClientError:false,
            NowPage:page+1,
            MaxPage:maxPage,
            ShopListResult:SelectShopListResult
        }
        res.json(responseBody)


    }catch (error){
        console.log(error)
        const responseBody:SelectShopStatusResponse = {
            ServerError:true,
            ClientError:false,
            ErrorMessage:"データベースエラー"
        }
        res.json(responseBody)

    }
    finally {
        await connection.end()
    }
})

router.delete("/delete",async (req:Request,res:Response)=>{
    const {shopId =null} = req.body

    const connection:Connection = await createConnection(mysqlSetting)
    try {
        const CheckExistShopIdSQL = "select count(*) as count from shops where shop_id = ? and is_deleted = 0"
        const [CheckExistShopIdResult,]:any = await connection.query(CheckExistShopIdSQL,[shopId])

        if (!CheckExistShopIdResult[0].count){
            const responseBody:BaseApiResponse = {
                ServerError:false,
                ClientError:true,
                ErrorMessage:"該当IDなし/もしくは削除済みです。"
            }
            res.json(responseBody)
            return
        }
        const DeleteShopSQL = "update shops set is_deleted = 1 and updated_at = current_timestamp where shop_id = ?"

        await connection.query(DeleteShopSQL,[shopId])
        const responseBody:BaseApiResponse = {
            ServerError:false,
            ClientError:false
        }
        res.json(responseBody)

    }catch (error){
        console.log(error)
        const responseBody:BaseApiResponse = {
            ServerError:true,
            ClientError:false,
            ErrorMessage:"サーバーエラー"
        }
        res.json(responseBody)
    }finally {
        await connection.end()
    }

})

router.post("/edit",async (req:Request, res:Response) => {
    const {Key=null,Data=null,ShopId=null}:EditDataRequestBody = req.body
    console.log(req.body)
    if (Key!="shop_name"&&Key!="shop_memo"){
        const responseBody:BaseApiResponse = {
            ServerError:false,
            ClientError:true,
            ErrorMessage:"データの形式に誤りがあります。"
        }
        res.json(responseBody)
        return
    }

    const connection:Connection = await createConnection(mysqlSetting)
    try {
        const checkShopIdSQL:SQL =
            "select count(*) as count from shops where shop_id = ? and is_deleted = 0"
        const [checkShopIdResult,]:any = await connection.query(checkShopIdSQL,[ShopId])

        if(!checkShopIdResult[0].count){
            const responseBody:BaseApiResponse = {
                ServerError:false,
                ClientError:true,
                ErrorMessage:"存在しないID"
            }
            res.json(responseBody)
            return
        }

        const updateShopDataSQL = "update shops set ?? = ?,updated_at = current_timestamp where shop_id = ?"
        await connection.query(updateShopDataSQL,[Key,Data,ShopId])

        const responseBody:BaseApiResponse={
            ServerError:false,
            ClientError:false
        }
        res.json(responseBody)

    }catch (error){
        console.log(error)
        const responseBody:BaseApiResponse={
            ServerError:true,
            ClientError:false,
            ErrorMessage:"データベースエラー"
        }
        res.json(responseBody)
    }finally {
        await connection.end()
    }
})


router.get("/status",async (req:Request,res:Response)=>{
    const {shopId=null} = req.query
    if (!shopId){
        const responseBody:SelectShopStatusResponse = {
            ServerError:false,
            ClientError:true,
            ErrorMessage:"必要な情報が足りません。"
        }
        res.json(responseBody)
        return
    }

    const connection:Connection = await createConnection(mysqlSetting)

    try {
        const CheckShopIdSQL:SQL = "select count(*) as count from shops where shop_id = ? and is_deleted = 0"
        const [CheckShopIdResult,]:any = await connection.query(CheckShopIdSQL,[shopId])
        if (!CheckShopIdResult[0].count){
            const responseBody:SelectShopStatusResponse = {
                ServerError:false,
                ClientError:true,
                ErrorMessage:"存在しないIDです。"
            }
            res.json(responseBody)
            return
        }
        const SelectStatusDataSQL:SQL = "select shop_name as shopName,shop_memo as shopMemo from shops where shop_id = ? and is_deleted = 0"

        const [SelectStatusDataResult,]:any = await connection.query(SelectStatusDataSQL,[shopId])

        const shopName = SelectStatusDataResult[0].shopName
        const shopMemo = SelectStatusDataResult[0].shopMemo

        const SelectStatusTagSQL = "select tag_name,tag_id from tags where tag_id in (select tag_id from shop_to_tag where shop_id = ? and is_deleted = 0) and is_deleted = 0"
        const [SelectStatusTagResult,]:any = await connection.query(SelectStatusTagSQL,[shopId])

        const responseBody:SelectShopStatusResponse ={
            ServerError:false,
            ClientError:false,
            ShopName:shopName,
            ShopMemo:shopMemo,
            TagList:SelectStatusTagResult
        }
        res.json(responseBody)

    }catch (error){
        console.log(error)
        const responseBody:SelectShopStatusResponse = {
            ServerError:true,
            ClientError:false,
            ErrorMessage:"データベースエラー"
        }

        res.json(responseBody)

    }finally {
        await connection.end()
    }

})



export default router
