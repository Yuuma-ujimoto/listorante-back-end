
export type SQL = string

export interface BaseApiResponse {
    ServerError: boolean,
    ClientError: boolean,
    ErrorMessage?: string
}

export interface CreateShopResponse {
    ServerError: boolean,
    ClientError: boolean,
    ErrorMessage?: string
    ShopId?: number
}

interface ShopListCol {
    shop_id: number|null,
    shop_name: string|null
}


type ShopList = Array<ShopListCol>

export interface SelectShopListRequest {
    page?:number
}

export type SelectShopListResponse = BaseApiResponse &{
    ShopListResult?: ShopList,
    NowPage?:number
    MaxPage?:number
}

export interface ShopListData{
    shop_list:ShopList,
    isDeleteModalOpen:boolean,
    NowPage:number,
    MaxPage:number,
    axiosEnd:boolean
}

export interface tagData{
    tag_id:number|null,
    tag_name:string|null
}

export interface SelectShopStatusResponse {
    ServerError: boolean,
    ClientError: boolean,
    ErrorMessage?: string,
    ShopName?: string,
    ShopMemo?: string,
    TagList?:tagData[]
}


export type EditDataKey = "shop_memo" | "shop_name"

export interface EditDataRequestBody {
    Data: string|null,
    Key: EditDataKey|null,
    ShopId: string | string[] | null,

}


export type getTagIdResponse = BaseApiResponse &{
    TagId?:number|null
}

export interface addTagRequestBody{
    shop_id:null|number|string,
    tag_name:null|string|undefined
}

export type addTagResponseBody= BaseApiResponse&{
    tagId:number
}

export interface deleteTagRequestBody{
    shop_id:null|number|string,
    tag_id:null|number|undefined
}


export interface StatusViewData {
    shopName: string,
    lastUpdateShopName:string,
    shopMemo: string,
    lastUpdateShopMemo: string,
    textAreaRow: number,
    tagList:tagData[]
}

export interface TagListData{
    tag_text:string,
    isAddTagModalOpen: any,
    isDeleteTagModalOpen: any,
    tagName: string,
    deleteTagId: null|number,
    InComponentTagList:tagData[]
}
