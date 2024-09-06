


export type BambuDevice = {
    dev_id: string,
    name: string,
    online: boolean,
    print_status: string,
    dev_model_name: string,
    dev_product_name: string,
    dev_access_code: string,
    nozzle_diameter: number,
    dev_structure: string
}

// MESSAGES

export type BambuMessage = {
    id: number,
    type: number,
    taskMessage: BambuTaskMessage,
    commentMentioned: any,
    ratingMentioned: any,
    from: any,
    isread: number,
    createTime: string
}

export type BambuTaskMessage = {
    id: number,
    title: string,
    cover: string,
    status: number,
    deviceId: string,
    deviceName: string,
    detail: string
}

export type BambuProfile = {
    uid: number,
    uidStr: string,
    account: string,
    name: string,
    avatar: string,
    fanCount: number,
    followCount: number,
    identifier: number,
    likeCount: number,
    collectionCount: number,
    downloadCount: number,
    productModels: string[],
    personal: {
        bio: string,
        links: string[],
        taskWeightSum: number,
        taskLengthSum: number,
        taskTimeSum: number,
        backgroundUrl: string,
        designsInfo: string[],
        userLevel: {
            level: number,
            gradeType: number
        }
    },
    isNSFWShown: number,
    myLikeCount: number,
    favoritesCount: number,
    defaultLicense: string,
    point: number,
    tpModelAccounts: string[],
    bannedPermission: {
        whole: boolean,
        comment: boolean,
        upload: boolean,
        redeem: boolean
    },
    MWCount: {
        myDesignDownloadCount: number,
        myInstanceDownloadCount: number,
        designCount: number,
        myDesignPrintCount: number,
        myInstancePrintCount: number
    },
    certificated: boolean,
    setting: {
        isLikeOpen: number,
        isFollowOpen: number,
        isFanOpen: number,
        isFirmwareBetaOpen: boolean,
        recommendStatus: number
    }
}