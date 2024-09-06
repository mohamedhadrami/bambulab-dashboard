
const MessageStatus = {
    1: "unknown",
    2: "Success",
    3: "Canceled HomingZFailed",
    4: "FilamentOut PausedByUser ToolheadFell"
}

export const HMS_SEVERITY_LEVELS = {
    "default": "unknown",
    1: "fatal",
    2: "serious",
    3: "common",
    4: "info"
}

export const HMS_MODULES = {
    "default": "unknown",
    0x05: "mainboard",
    0x0C: "xcam",
    0x07: "ams",
    0x08: "toolhead",
    0x03: "mc"
}

export enum HomeFlagValues {
    X_AXIS = 0x00000001, // Is x homed?
    Y_AXIS = 0x00000002, // Is y homed?
    Z_AXIS = 0x00000004, // Is z homed?
    VOLTAGE220 = 0x00000008, // Is the input power 220
    XCAM_AUTO_RECOVERY_STEP_LOSS = 0x00000010, // Print Setting (Auto-Recover from Step Loss)
    CAMERA_RECORDING = 0x00000020,
    AMS_CALIBRATE_REMAINING = 0x00000080, // AMS Setting (Remaining Filament Estimation)
    SD_CARD_PRESENT = 0x00000100, // Is there an SD card plugged in?
    SD_CARD_ABNORMAL = 0x00000200, // Is there an issue with SD Card?
    AMS_AUTO_SWITCH = 0x00000400, // AMS Setting (AMS Filament Backup)
    XCAM_ALLOW_PROMPT_SOUND = 0x00020000,
    WIRED_NETWORK = 0x00040000, // Ethernet, probably only on X1E
    FILAMENT_TANGLE_DETECT_SUPPORTED = 0x00080000,
    FILAMENT_TANGLE_DETECTED = 0x00100000,
    SUPPORTS_MOTOR_CALIBRATION = 0x00200000,
    DOOR_OPEN = 0x00800000, // Is door open?
    INSTALLED_PLUS = 0x04000000,
    SUPPORTED_PLUS = 0x08000000,
}
