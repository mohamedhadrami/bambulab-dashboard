

export interface MqttProps {
    id: string;
    publish: (id: string, command: any) => void;
}

export enum FanType {
    Part = "Part",
    Auxiliary = "Auxiliary",
    Chamber = "Chamber"
}
export const FanTypeToID: { [key in FanType]: number } = {
    [FanType.Part]: 1,
    [FanType.Auxiliary]: 2,
    [FanType.Chamber]: 3
};
export const FanTypeMax: { [key in FanType]: number } = {
    [FanType.Part]: 15,
    [FanType.Auxiliary]: 15,
    [FanType.Chamber]: 14
};


export enum PrintSpeed {
    Silent = 1,
    Standard = 2,
    Sport = 3,
    Ludicrous = 4
}
export const PrintSpeedName: { [key in PrintSpeed]: string } = {
    [PrintSpeed.Silent]: "Silent",
    [PrintSpeed.Standard]: "Standard",
    [PrintSpeed.Sport]: "Sport",
    [PrintSpeed.Ludicrous]: "Ludicrous"
}
export const PrintSpeedPercent: { [key in PrintSpeed]: number } = {
    [PrintSpeed.Silent]: 50,
    [PrintSpeed.Standard]: 100,
    [PrintSpeed.Sport]: 125,
    [PrintSpeed.Ludicrous]: 166
}
export const getPrintSpeedEnum = (spd_lvl: number): PrintSpeed => {
    if (spd_lvl in PrintSpeed) return spd_lvl as PrintSpeed;
    else return PrintSpeed.Standard;
}



export const CURRENT_STAGE_IDS: { [key: string]: string } = {
    "default": "unknown",
    "0": "printing",
    "1": "auto_bed_leveling",
    "2": "heatbed_preheating",
    "3": "sweeping_xy_mech_mode",
    "4": "changing_filament",
    "5": "m400_pause",
    "6": "paused_filament_runout",
    "7": "heating_hotend",
    "8": "calibrating_extrusion",
    "9": "scanning_bed_surface",
    "10": "inspecting_first_layer",
    "11": "identifying_build_plate_type",
    "12": "calibrating_micro_lidar",
    "13": "homing_toolhead",
    "14": "cleaning_nozzle_tip",
    "15": "checking_extruder_temperature",
    "16": "paused_user",
    "17": "paused_front_cover_falling",
    "18": "calibrating_micro_lidar", // DUPLICATED
    "19": "calibrating_extrusion_flow",
    "20": "paused_nozzle_temperature_malfunction",
    "21": "paused_heat_bed_temperature_malfunction",
    "22": "filament_unloading",
    "23": "paused_skipped_step",
    "24": "filament_loading",
    "25": "calibrating_motor_noise",
    "26": "paused_ams_lost",
    "27": "paused_low_fan_speed_heat_break",
    "28": "paused_chamber_temperature_control_error",
    "29": "cooling_chamber",
    "30": "paused_user_gcode",
    "31": "motor_noise_showoff",
    "32": "paused_nozzle_filament_covered_detected",
    "33": "paused_cutter_error",
    "34": "paused_first_layer_error",
    "35": "paused_nozzle_clog",
    "-1": "idle",  // DUPLICATED
    "255": "idle", // DUPLICATED
};

export const CURRENT_STAGE_OPTIONS: string[] = Array.from(new Set(Object.values(CURRENT_STAGE_IDS)));