// @/services/BambuMqtt.ts

import { IPacket } from "mqtt-packet";

/*
const handleOnMessage = (topic: string, message: Buffer, packet: IPacket) => {
    const response = JSON.parse(message.toString());
    let command;
    if (response.info) {
        command = response.info.command;
        if (command == 'get_version') this.printerVersion = response.info;
    } else if (response.upgrade) {
        command = response.upgrade.command;
        if (command == 'upgrade_confirm') this.upgradeConfirmStatus = response.upgrade;
        else if (command == 'consistency_confirm') this.upgradeConsistencyConfirmStatus = response.upgrade;
        else if (command == 'start') this.upgradeStartStatus = response.upgrade;
        else if (command == 'get_history') this.upgradeHistory = response.upgrade;
    } else if (response.print) {
        command = response.print.command;
        if (command == "push_status") this.printerStatus = response.print;
        else if (command == 'stop') this.stopPrintStatus = response.print;
        else if (command == 'pause') this.pausePrintStatus = response.print;
        else if (command == 'resume') this.resumePrintStatus = response.print;
        else if (command == 'ams_change_filament') this.amsChangeFilamentStatus = response.print;
        else if (command == 'ams_user_setting') this.amsUserSettingStatus = response.print;
        else if (command == 'ams_filament_setting') this.amsFilamentSettingStatus = response.print;
        else if (command == 'ams_control') this.amsControlStatus = response.print;
        else if (command == 'print_speed') this.printSpeedStatus = response.print;
        else if (command == 'gcode_file') this.printGcodeFileStatus = response.print;
        else if (command == 'gcode_line') this.printGcodeLineStatus = response.print;
        else if (command == 'calibration') this.printCalibrationStatus = response.print;
        else if (command == 'unload_filament') this.unloadFilamentStatus = response.print;
        else if (command == 'project_file') this.projectFileStatus = response.print;
    } else if (response.system) {
        command = response.system.command;
        if (command == 'ledctrl') this.ledCtrlStatus = response.system;
        else if (command == 'get_access_code') this.systemAccessCode = response.system;
    } else if (response.camera) {
        command = response.camera.command;
        if (command == 'ipcam_record_set') this.ipcamRecordSetStatus = response.camera;
        else if (command == 'ipcam_timelapse') this.ipcamTimelapseStatus = response.camera;
    } else if (response.xcam) {
        command = response.xcam.command;
        if (command == 'xcam_control_set') this.xcamControlSetStatus = response.xcam;
    } else if (response.liveview) {
        command = response.liveview.command;
        if (command == 'prepare') this.liveviewPrepareStatus = response.liveview;
    } else if (response.t_utc) {
        command = 't_utc';
        //console.log(new Date(response.t_utc).toLocaleString());
    } else {
        command = 'unknown'
        console.log(`Unknown message!
                        \n\tTopic: ${topic}
                        \n\tMessage: ${message}
                        \n\tResponse: ${response}
                        \n\tPacket: ${packet}`);
    }
}
*/

/* REQUESTS */


/**
 * Get the version information of each module.
 * @request info.get_version
 */
export const infoGetVersion = () => ({
    "info": {
        "sequence_id": "69",
        "command": "get_version"
    }
})


/**
 * Check the status of 3D Printer
 * @request pushing.pushall or print.push_status
 */
export const printPushStatus = () => ({
    "pushing": {
        "sequence_id": "6969",
        "command": "pushall",
        "version": 1,
        "push_target": 1
    }
})


/**
 * Part of firmware upgrade process
 * @request upgrade.upgrade_confirm
 */
export const upgradeUpgradeConfirm = () => ({
    "upgrade": {
        "sequence_id": "0",
        "command": "upgrade_confirm",
        "src_id": 1
    }
})


/**
 * Part of firmware upgrade process
 * @request upgrade.consistency_confirm
 */
export const upgradeConsistencyConfirm = () => ({
    "upgrade": {
        "sequence_id": "0",
        "command": "consistency_confirm",
        "src_id": 1
    }
})


/**
 * Starts upgrade process
 * @param {string} module module to upgrade, either "ota" or "ams"
 * @request upgrade.start
 */
export const upgradeStart = (module: string) => ({
    "upgrade": {
        "sequence_id": "0",
        "command": "start",
        "src_id": 1,
        "url": "...",
        "module": module,
        "version": ""
    }
})


/**
 * Gets update history
 * @request upgrade.get_history
 */
export const upgradeGetHistory = () => ({
    "upgrade": {
        "sequence_id": "0",
        "command": "get_history"
    }
})


/**
 * Stops print
 * @requires qos of 1
 * @todo Make sure qos is set to 1 for this request
 * @request print.stop
 */
export const printStop = () => ({
    "print": {
        "sequence_id": "0",
        "command": "stop",
        "param": "" // Always empty
    }
})


/**
 * Pauses print
 * @requires qos of 1
 * @todo Make sure qos is set to 1 for this request
 * @request print.pause
 */
export const printPause = () => ({
    "print": {
        "sequence_id": "0",
        "command": "pause",
        "param": "" // Always empty
    }
})


/**
 * Resumes print
 * @requires qos of 1
 * @todo Make sure qos is set to 1 for this request
 * @request print.resume
 */
export const printResume = () => ({
    "print": {
        "sequence_id": "0",
        "command": "resume",
        "param": "" // Always empty
    }
})


/**
 * Change filament using AMS
 * @param {number} trayId - ID provided in print.push_status request 
 * (print.ams.ams[0].tray[TRAY_NUMBER].id), either 0, 1, 2, or 3
 * @param {number} oldTemp - 
 * @param {number} newTemp - 
 * @todo Provide better description for oldTemp and newTemp
 * @request print.ams_change_filament
 */
export const printAmsChangeFilament = (trayId: number, oldTemp: number, newTemp: number) => ({
    "print": {
        "sequence_id": "0",
        "command": "ams_change_filament",
        "target": trayId,
        "curr_temp": oldTemp,
        "tar_temp": newTemp
    }
})


/**
 * Change AMS settings
 * @param {number} amsId - Index of AMS (print.ams.ams.id)
 * @param {boolean} isStartupReadOption - Read RFID on startup. Default true
 * @param {boolean} isTrayReadOption - Read RFID on insertion. Default true
 * @request print.ams_user_setting
 */
export const printAmsUserSetting = (amsId: number, isStartupReadOption: boolean = true, isTrayReadOption: boolean = true) => ({
    "print": {
        "sequence_id": "0",
        "command": "ams_user_setting",
        "ams_id": amsId,
        "startup_read_option": isStartupReadOption,
        "tray_read_option": isTrayReadOption
    }
})


/**
 * Change filament settings in AMS
 * @param {number} amsId - Index of the AMS (print.ams.ams.id)
 * @param {number} trayId - Index of the tray (print.ams.ams[0].tray[TRAY_NUMBER].id), 
 * either 0, 1, 2, or 3
 * @param {string} trayColor - Color of the filament, formatted as hex RRGGBBAA (alpha 
 * must be FF)
 * @param {number} minNozzleTemp - Minimum nozzle temperature for filament (in C)
 * @param {number} maxNozzleTemp - Maximum nozzle temperature for filament (in C)
 * @param {string} filamentType - Type of filament
 * @todo Figure out what tray_info_dx is
 * 
 * @request print.ams_filament_setting
 */
export const printAmsFilamentSetting = (amsId: number, trayId: number, trayColor: string, minNozzleTemp: number, maxNozzleTemp: number, filamentType: string) => ({
    "print": {
        "sequence_id": "0",
        "command": "ams_filament_setting",
        "ams_id": amsId,
        "tray_id": trayId,
        "tray_info_idx": "", // Probably the setting ID of the filament profile
        "tray_color": trayColor,
        "nozzle_temp_min": minNozzleTemp,
        "nozzle_temp_max": maxNozzleTemp,
        "tray_type": filamentType
    }
})


/**
 * Sends control commands to AMS
 * @param {string} amsCommand - Can be either, "resume", "reset", or "pause"
 * @request print.ams_control
 */
export const printAmsControl = (amsCommand: string) => ({
    "print": {
        "sequence_id": "0",
        "command": "ams_control",
        "param": amsCommand
    }
})


/**
 * Sets print speed
 * @param {string} printSpeed - A speed level as a string, can be either "1" (silent), 
 * "2" (standard), "3" (sport), or "4" (ludicrous)
 * @request print.print_speed
 */
export const printPrintSpeed = (printSpeed: string) => ({
    "print": {
        "sequence_id": "0",
        "command": "print_speed",
        "param": printSpeed
    }
})


/**
 * Prints a gcode file
 * @param {string} filename - Filename on the printer's filesystem, must be absolute path
 * @request print.gcode_file
 */
export const printGcodeFile = (filename: string) => ({
    "print": {
        "sequence_id": "0",
        "command": "gcode_file",
        "param": filename
    }
})


/**
 * Send raw gcode to the printer
 * @param {string} gcode - String including the gcode. For multiple lines, use \n
 * @todo see what userId provides
 * @request print.gcode_line 
 */
export const printGcodeLine = (gcode: string) => ({
    "print": {
        "sequence_id": "0",
        "command": "gcode_line",
        "param": gcode,
        "user_id": "1234"
    }
})


/**
 * Starts calibration process
 * @todo see what happens when calibration finishes, if you get report
 * @request print.calibration
 */
export const printCalibration = (motor_noise: boolean = false, vibration: boolean = false, bed_leveling: boolean = false, xcam_cali: boolean = false) => {
    const options = (motor_noise ? 1 << 3 : 0)
        + (vibration ? 1 << 2 : 0)
        + (bed_leveling ? 1 << 1 : 0)
        + (xcam_cali ? 1 << 0 : 0);

    const command = {
        "print": {
            "sequence_id": "0",
            "command": "calibration",
            "option": options
        }
    };

    return command;
}

/**
 * Unloads filament, if any loaded
 * @request print.unload_filament
 */
export const printUnloadFilament = () => ({
    "print": {
        "sequence_id": "0",
        "command": "unload_filament"
    },
})


/**
 * Probably prints project file (.3mf)???
 * @todo all of it
 * @request print.project_file
 */
export const printProjectFile = () => ({
    "print": {
        "sequence_id": "0",
        "command": "project_file",
        "param": "Metadata/plate_X.gcode",
        "project_id": "0", // Always 0 for local prints
        "profile_id": "0", // Always 0 for local prints
        "task_id": "0", // Always 0 for local prints
        "subtask_id": "0", // Always 0 for local prints
        "subtask_name": "",

        "file": "", // Filename to print, not needed when "url" is specified with filepath
        "url": "file:///mnt/sdcard", // URL to print. Root path, protocol can vary. E.g., if sd card, "ftp:///myfile.3mf", "ftp:///cache/myotherfile.3mf"
        "md5": "",

        "timelapse": true,
        "bed_type": "auto", // Always "auto" for local prints
        "bed_levelling": true,
        "flow_cali": true,
        "vibration_cali": true,
        "layer_inspect": true,
        "ams_mapping": "",
        "use_ams": false
    }
})


/**
 * Controls lamps
 * @param {string} node Must be either "chamber_light" or "work_light"
 * @param {string} mode Must be either "on", "off", or "flashing"
 * @param {number} ledOnTime LED on time in ms (Required for all, only for flashing 
 * mode, default 500)
 * @param {number} ledOffTime LED off time in ms (Required for all, only for flashing 
 * mode, default 500)
 * @param {number} loopTimes Number of times to loop (Required for all, only for flashing 
 * mode, default 1)
 * @param {number} intervalTime Looping interval in ms (Required for all, only for 
 * flashing mode, default 1000)
 * @request system.ledctrl
 */
export const systemLedCtrl = (node: string, mode: string, ledOnTime: number = 500, ledOffTime: number = 500, loopTimes = 1, intervalTime: number = 1000) => ({
    "system": {
        "sequence_id": "0",
        "command": "ledctrl",
        "led_node": node,
        "led_mode": mode,
        "led_on_time": ledOnTime,
        "led_off_time": ledOffTime,
        "loop_times": loopTimes,
        "interval_time": intervalTime
    }
})


/**
 * Gets LAN access code. Not neccessary, as access code in provided from 
 * /v1/iot-service/api/user/bind and stored in utils/dataStorage.js. Access it by calling
 * getPrinterData()
 * @request system.get_access_code
 */
export const systemGetAccessCode = () => ({
    "system": {
        "sequence_id": "0",
        "command": "get_access_code"
    }
})


/**
 * Toggles creation of recodings when printing
 * @param {boolean} command Command to enable or disable recording
 * @request camera.ipcam_record_set
 */
export const cameraIpcamRecordSet = (command: boolean) => ({
    "camera": {
        "sequence_id": "0",
        "command": "ipcam_record_set",
        "control": command ? "enable" : "disable"
    }
})


/**
 * Toggles creation of timelapses during prints
 * @param {boolean} command Command to enable or disable recording
 * @request camera.ipcam_timelapse
 */
export const cameraIpcamTimelapse = (command: boolean) => ({
    "camera": {
        "sequence_id": "0",
        "command": "ipcam_timelapse",
        "control": command ? "enable" : "disable"
    }
})


/**
 * Configures XCam
 * @param {string} moduleName Module to configure, either "first_layer_inspector" 
 * or "spaghetti_detector"
 * @param {boolean} command Command to enable or disable module
 * @param {boolean} isPrintHalt Stop the print if issue from module is detected
 * @request xcam.xcam_control_set
 */
export const xcamXcamControlSet = (moduleName: string, control: boolean, additionalParams?: Record<string, any>) => ({
    "xcam": {
        "sequence_id": "0",
        "command": "xcam_control_set",
        "module_name": moduleName,
        "control": control,
        ...additionalParams
    }
});


/**
 * Preps camera for live stream
 * @param {string} ttcode 
 * @param {string} password 
 * @param {string} authkey 
 * @request liveview.prepare
 */
export const liveviewPrepare = (ttcode: string, password: string, authkey: string) => ({
    "liveview": {
        "sequence_id": 0,
        "command": "prepare",
        "ttcode": ttcode,
        "passwd": password,
        "authkey": authkey,
    }
})
