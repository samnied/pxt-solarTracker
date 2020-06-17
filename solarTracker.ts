enum sensorId {
    TopLeft,
    TopRight,
    BottomLeft,
    BottomRight
    }
enum servoId {
    Pan,
    Tilt
}
enum directionId {
    Up,
    Down,
    Left,
    Right
}
enum modeId {
    Manually,
    Automatic,
    Remote
}

/**
 * Functions to operate with the solar tracker.
 */

//% weight=100 color=#0fbc11 icon=""
namespace Solar {
    // I2C address of the device
    const i2cAddr = 8;
    // time to wait before read I2C, in micro seconds
    const wTime = 1000;

    export function writeCommand(command: string): void {
        // creat comand buffer to store each char of the command string
        let comBuf = pins.createBuffer(16);
        // comand string 
        let comStr = command;

        for (let i = 0; i < comStr.length; i++) {
            comBuf.setNumber(NumberFormat.Int8LE, i, comStr.charCodeAt(i));
        }
        pins.i2cWriteBuffer(i2cAddr, comBuf, false);
    }

    export function read(): number {
        let rBuf = pins.i2cReadBuffer(i2cAddr, 4, false);
        let str = "";
        for (let i = 0; i < 4; i++) {
            str += String.fromCharCode(rBuf.getNumber(NumberFormat.Int8LE, i));
        }
        return parseInt(str);
    }

    /**
     * Reads the sensor value
     * returns the voltage in mV
     * @param sensorId : Which sensor should be read.
     */
    //% blockId="solar_read_sensor" block=" Sensor %sensorId| value" 
    export function readSensor(id: sensorId): number {
        let str = ""
        // "tl" : 0,
        // "tr" : 1,
        // "bl" : 2,
        // "br" : 3
        switch (id) {
            case sensorId.TopLeft: str = "tl,?";
                break;
            case sensorId.TopRight: str = "tr,?";
                break;
            case sensorId.BottomLeft: str = "bl,?";
                break;
            case sensorId.BottomRight: str = "br,?";
                break;
        }
        writeCommand(str);
        control.waitMicros(wTime)
        return read();
    }

    /**
     * Reads the servo 
     * returns the absolute postion in degrees
     * @param servoId : Which servo should be read.
     */
    //% blockId="solar_read_servo" block="Servo %servoId| value" 
    export function readServo(id: servoId): number {
        let str = "";

        switch (id) {
            case servoId.Pan: 
                str = "servoP,?";
                break;
            case servoId.Tilt: str = "servoT,?";
                break;
            default:
                break;
        }
        writeCommand(str);
        control.waitMicros(wTime)
        return read();
    }
    
    /**
     * Reads the solarcell value
     * returns the voltage in mV
     */
    //% blockId="solar_read_solar_cell" block="solar cell value" 
    export function readSolarCell(): number {
        let str = "solarC,?";
        writeCommand(str);
        control.waitMicros(wTime)
        return read();
    }

    /**
     * Reads the actual operation mode
     * returns the operation mode as enum
     */
    //% blockId="solar_mode" block="mode value" 
    export function mode(): number {
        let str = "opMode,?";
        writeCommand(str);
        control.waitMicros(wTime)
        return read();
    }

    /**
     * Turns the servo to absolute position
     * @param servoId : Which servo should be turned.
     * @param degree : Position to be turned to.
     */
    //% blockId="solar_write_servo_position" block=" Set servo %id position %degree" 
    //% degree.min=0 degree.max=180 degree.defl=90
    export function writeServoPosition(id: servoId, degree: number): void {
        let str = "";

        switch (id) {
            case servoId.Pan: str = "servoP,";
                break;
            case servoId.Tilt: str = "servoT,";
                break;
        }
        // auto conversion from number to string
        str += degree.toString();
        writeCommand(str);
    }

    /**
     * Set operation mode
     * @param modeId : Which mode should be set.
     */
    //% blockId="solar_set_mode" block="Set mode %id=modeEnum|" 
    export function setMode(id: modeId): void {
        let str = "opMode,";

        switch (id) {
            case modeId.Manually: str += 0;
                break;
            case modeId.Automatic: str += 1;
                break;
            case modeId.Remote: str += 2;
                break;
        }
        writeCommand(str);
    }

    /**
     * Turn the tracker 
     * Up
     * Down
     * Left
     * Right
     * @param direction : Direction to turn.
     * @param val : Degrees to turn.
     */
    //% blockId="solar_turn_direction" block="turn %dir=solar_dirEnum| %val"
    //% val.min=0 val.max=180 val.defl=1
    export function turnDirection(direction: number, val: number): void {
        let turn = direction*1000 + val;
        let str = "turnDir,";
        str += turn.toString();
        writeCommand(str);
    }

    /**
     * Turn the tracker relative
     * @param servoId : Which servo should be turned.
     * @param val : Degrees to turn relative.
     */
    // function to turn Pan or Tilt, value can be + or -
    //% blockId="solar_turnval" block="turn %servo=solar_servoEnum| %val"
    //% val.min=-180 val.max=180 val.defl=1
    export function turnVal(servo: servoId, val: number): void {
        switch (servo) {
            case servoId.Pan:
                if(val > 0)
                {
                    turnDirection(directionId.Left, val)
                }
                else
                {
                    turnDirection(directionId.Right, Math.abs(val))
                }
                break;
            case servoId.Tilt:
                if(val > 0)
                {
                    turnDirection(directionId.Down, val)
                }
                else
                {
                    turnDirection(directionId.Up, Math.abs(val))
                }
                break;
        }
    }

    // provide direction enum as block
    //% blockId="solar_dirEnum" block="%dir"
    export function dirEnum(dir: directionId): directionId {
        return dir;
    }
    // provide servo enum as block
    //% blockId="solar_servoEnum" block="%servoId"
    export function servoEnum(servo: servoId): servoId {
        return servo;
    }
    // provide mode enum as block
    //% blockId="solar_modeEnum" block="%modeId"
    export function modeEnum(mode: modeId): modeId {
        return mode;
    }
}