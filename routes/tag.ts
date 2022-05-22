import {Connection, createConnection} from "mysql2/promise";
import {mysqlSetting} from "../settings/mysql";

import {Router, Request, Response} from "express";

import {getTagId} from "../components/getTagId"
import {addTagRequestBody, BaseApiResponse, deleteTagRequestBody} from "../Types";

const router: Router = Router()

router.post("/add", async (req, res) => {
    const {shop_id = null, tag_name = null}: addTagRequestBody = req.body
    if (!shop_id || !tag_name) {
        const responseBody = {
            ServerError: false,
            ClientError: true,
            ErrorMessage: "必要な情報が足りません。"
        }
        res.json(responseBody)
    }

    const getTagIdResult = await getTagId(tag_name)
    if (getTagIdResult.ServerError || getTagIdResult.ClientError) {
        res.json(getTagIdResult)
        return
    }
    if (!getTagIdResult.TagId) {
        const responseBody = {
            ServerError: false,
            ClientError: true,
            ErrorMessage: "IDエラー"
        }
        res.json(responseBody)
        return
    }

    const connection = await createConnection(mysqlSetting)
    try {
        const checkShopIdSQL = "select count(*) as count from shops where shop_id = ? and is_deleted = 0"
        const [checkShopIdResult,]: any = await connection.query(checkShopIdSQL, [shop_id])

        if (!checkShopIdResult[0].count) {
            const responseBody: BaseApiResponse = {
                ServerError: false,
                ClientError: true,
                ErrorMessage: "存在しないID"
            }
            res.json(responseBody)
            return
        }

        const tag_id: number = getTagIdResult.TagId

        const insertTagSQL = "insert into shop_to_tag(shop_id,tag_id) values(?,?) "
        await connection.query(insertTagSQL, [shop_id, tag_id])
        // エラーがなければ送る内容は変わらないのでgetTagIdResultをそのまま送信
        res.json(getTagIdResult)

    } catch (e) {
        const responseBody: BaseApiResponse = {
            ServerError: true,
            ClientError: false,
            ErrorMessage: "サーバーエラー"
        }
        res.json(responseBody)
        return
    } finally {
        await connection.end()
    }


})

router.delete("/delete", async (req: Request, res: Response) => {
    const {shop_id = null, tag_id = null}: deleteTagRequestBody = req.body
    if (!shop_id || !tag_id) {
        const responseBody: BaseApiResponse = {
            ServerError: false,
            ClientError: true,
            ErrorMessage: "必要な情報が足りません。"
        }
        res.json(responseBody)
        return
    }

    const connection: Connection = await createConnection(mysqlSetting)
    try {
        const CheckExistShopSQL = "select count(*) as count from shops where shop_id = ? and is_deleted = 0"
        const [CheckExistShopResult,]: any = await connection.query(CheckExistShopSQL, [shop_id])
        if (CheckExistShopResult[0].count) {
            const responseBody: BaseApiResponse = {
                ServerError: false,
                ClientError: true,
                ErrorMessage: "存在しないShopIdです。"
            }
            res.json(responseBody)
        }

        const CheckExistTagSQL = "select count(*) as count from tags where tag_id = ? and is_deleted = 0 "
        const [CheckExistTagResult,]: any = await connection.query(CheckExistTagSQL, [tag_id])
        if (CheckExistTagResult[0].count) {
            const responseBody: BaseApiResponse = {
                ServerError: false,
                ClientError: true,
                ErrorMessage: "存在しないTagIdです。"
            }
            res.json(responseBody)
        }

        const DeleteShopToTagSQL = "update shop_to_tag set is_deleted = 1 where is_deleted = 0 and shop_id = ? and tag_id = ?"
        await connection.query(DeleteShopToTagSQL)

        const responseBody: BaseApiResponse = {
            ServerError: false,
            ClientError: false,
        }
        res.json(responseBody)

    } catch (error) {
        console.log(error)
        const responseBody:BaseApiResponse ={
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

export default router
