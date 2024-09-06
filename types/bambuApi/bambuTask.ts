// @/types/bambuApi/bambuTask.ts

export type BambuTask = {
    id: number,
    designId: number,
    designTitle: string,
    instanceId: number,
    modelId: string,
    title: string,
    cover: string,
    status: number,
    feedbackStatus: number,
    startTime: string,
    endTime: string,
    weight: number,
    length: number,
    costTime: number,
    profileId: number,
    plateIndex: number,
    plateName: string,
    deviceId: string,
    amsDetailMapping: BambuAmsDetailMapping[],
    mode: string,
    isPublicProfile: boolean,
    isPrintable: boolean,
    deviceModel: string,
    deviceName: string,
    bedType: string
}

export type BambuAmsDetailMapping = {
    ams: number,
    sourceColor: string,
    targetColor: string,
    filamentId: string,
    filamentType: string,
    targetFilamentType: string,
    weight: number
}

export type BambuTaskDetails = {
    message: string,
    code: any,
    error: any,
    profile_id: string,
    model_id: string,
    status: string,
    name: string,
    content: any,
    create_time: string,
    update_time: string,
    context: BambuTaskDetailsContext,
    filename: string,
    url: string,
    md5: string,
    keystore_xml: any
}

export type BambuTaskDetailsContext = {
    compatibility: BambuTaskDetailsContextCompatibility,
    other_compatibility: BambuTaskDetailsContextCompatibility[],
    pictures: any,
    configs: BambuTaskDetailsContextConfig[],
    plates: BambuTaskDetailsContextPlate[],
    materials: BambuTaskDetailsContextMaterial[],
    auxiliary_pictures: BambuTaskDetailsContextAuxiliaryPictures,
    auxiliary_bom: BambuTaskDetailsContextAuxiliaryBOM,
    auxiliary_guide: BambuTaskDetailsContextAuxiliaryGuide,
    auxiliary_other: BambuTaskDetailsContextAuxiliaryOther
}

export type BambuTaskDetailsContextCompatibility = {
    dev_model_name: string,
    dev_product_name: string,
    nozzle_diameter: number
}

export type BambuTaskDetailsContextConfig = {
    name: string,
    dir: string,
    url: string
}

export type BambuTaskDetailsContextPlate = {
    index: number,
    name: string,
    thumbnail: BambuTaskDetailsContextPlatePicture,
    top_picture: BambuTaskDetailsContextPlatePicture,
    pick_picture: BambuTaskDetailsContextPlatePicture,
    no_light_picture: BambuTaskDetailsContextPlatePicture,
    objects: BambuTaskDetailsContextPlateObject[],
    skipped_objects: any,
    label_object_enabled: boolean,
    prediction: number,
    weight: number,
    gcode: BambuTaskDetailsContextPlateGcode,
    filaments: BambuTaskDetailsContextPlateFilament[],
    warning: any[]
}

export type BambuTaskDetailsContextPlatePicture = {
    name: string,
    dir: string,
    url: string
}

export type BambuTaskDetailsContextPlateObject = {
    name: string,
    identify_id: string
}

export type BambuTaskDetailsContextPlateGcode = {
    name: string,
    dir: string,
    url: string
}

export type BambuTaskDetailsContextPlateFilament = {
    id: string,
    type: string,
    color: string,
    used_m: string,
    used_g: string
}

export type BambuTaskDetailsContextMaterial = {
    color: string,
    material: string
}

export type BambuTaskDetailsContextAuxiliaryPictures = {

}

export type BambuTaskDetailsContextAuxiliaryBOM = {

}

export type BambuTaskDetailsContextAuxiliaryGuide = {

}

export type BambuTaskDetailsContextAuxiliaryOther = {

}
