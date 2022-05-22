import {createConnection,ConnectionOptions} from "mysql2/promise";
import {mysqlSetting} from "../settings/mysql";
import {getTagIdResponse} from "../Types";

export const getTagId = async function (tagName: string | null | undefined):Promise<getTagIdResponse>{
if (!tagName){
    return {
        ServerError:false,
        ClientError:true,
        ErrorMessage:"タグ名が指定されていません。"
    }
}
    const connection = await createConnection(mysqlSetting)
    try {
        const checkExistTagIdSQL =
            "select count(*) as count from tags where tag_name = ? and is_deleted = 0"

        const [checkExistTagIdResult,]:any = await connection.query(checkExistTagIdSQL,[tagName])
        if(!checkExistTagIdResult[0].count){
            const insertTagSQL = "insert into tags(tag_name) values(?)"
            const [insertTagResult,]:any = await connection.query(insertTagSQL,[tagName])
            const tagId:number = insertTagResult.insertId
            return {
                ServerError:false,
                ClientError:false,
                TagId:tagId
            }
        }
        const selectTagIdSQL = "select tag_id from tags where tag_name = ? and is_deleted = 0"
        const [selectTagIdResult,]:any = await connection.query(selectTagIdSQL,[tagName])
        return {
            ServerError:false,
            ClientError:false,
            TagId:selectTagIdResult[0].tag_id
        }

    }catch (error){
        console.log(error)
        return {
            ServerError:true,
            ClientError:false,
            ErrorMessage:"サーバーエラー"
        }

    }finally {
        await connection.end()
    }


}
