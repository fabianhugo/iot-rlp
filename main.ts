let distanceBackup: number = 0;
enum DistanceUnit {
//% block="cm"
cm = 1,
//% block="inch"
inch = 2,
};
/**
 * Functions to operate WiFi module.
 */
//% weight=10 color=#9F79EE icon="\uf1b3" block="IoT"
//% groups='["4-Digit","Ultrasonic","Gesture","Thumbjoystick","UartWiFi"]'
namespace IoT {



    let isWifiConnected = false;
    /**
     * Setup Grove - Uart WiFi V2 to connect to  Wi-Fi
     */
    //% subcategory="WiFi"
    //% block="Setup Wifi|TX %txPin|RX %rxPin|Baud rate %baudrate|SSID = %ssid|Password = %passwd"
    //% group="UartWiFi"
    //% txPin.defl=SerialPin.C17
    //% rxPin.defl=SerialPin.C16
    //% baudRate.defl=BaudRate.BaudRate115200
    //% weight=80
    export function setupWifi(txPin: SerialPin, rxPin: SerialPin, baudRate: BaudRate, ssid: string, passwd: string) {
        let result = 0

        isWifiConnected = false

        serial.redirect(
            txPin,
            rxPin,
            baudRate
        )

        sendAtCmd("AT")
        result = waitAtResponse("OK", "ERROR", "None", 1000)

        sendAtCmd("AT+CWMODE=1")
        result = waitAtResponse("OK", "ERROR", "None", 1000)

        sendAtCmd(`AT+CWJAP="${ssid}","${passwd}"`)
        result = waitAtResponse("WIFI GOT IP", "ERROR", "None", 20000)

        if (result == 1) {
            isWifiConnected = true
        }
    }

    /**
     * Check if Grove - Uart WiFi V2 is connected to Wifi
     */
    //% subcategory="WiFi"
    //% block="Wifi OK?"
    //% group="UartWiFi"
    //% weight=70
    export function wifiOK() {
        return isWifiConnected
    }

 /**
     * Send data to ThinkSpeak
     */
    //% subcategory="WiFi"
    //% block="Send Data to your ThinkSpeak Channel|Write API Key %apiKey|Field1 %field1|Field2 %field2|Field3 %field3|Field4 %field4|Field5 %field5|Field6 %field6|Field7 %field7|Field8 %field8"
    //% group="UartWiFi"
    //% expandableArgumentMode="enabled"
    //% weight=20
    //% apiKey.defl="your Write API Key"
    export function sendToThinkSpeak(apiKey: string, field1: number, field2: number, field3: number, field4: number, field5: number, field6: number, field7: number, field8: number) {
        let result = 0
        let retry = 2

        // close the previous TCP connection
        if (isWifiConnected) {
            sendAtCmd("AT+CIPCLOSE")
            waitAtResponse("OK", "ERROR", "None", 2000)
        }

        while (isWifiConnected && retry > 0) {
            retry = retry - 1;
            // establish TCP connection
            sendAtCmd("AT+CIPSTART=\"TCP\",\"api.thingspeak.com\",80")
            result = waitAtResponse("OK", "ALREADY CONNECTED", "ERROR", 2000)
            if (result == 3) continue

            let data = "GET /update?api_key=" + apiKey
            if (!isNaN(field1)) data = data + "&field1=" + field1
            if (!isNaN(field2)) data = data + "&field2=" + field2
            if (!isNaN(field3)) data = data + "&field3=" + field3
            if (!isNaN(field4)) data = data + "&field4=" + field4
            if (!isNaN(field5)) data = data + "&field5=" + field5
            if (!isNaN(field6)) data = data + "&field6=" + field6
            if (!isNaN(field7)) data = data + "&field7=" + field7
            if (!isNaN(field8)) data = data + "&field8=" + field8

            sendAtCmd("AT+CIPSEND=" + (data.length + 2))
            result = waitAtResponse(">", "OK", "ERROR", 2000)
            if (result == 3) continue
            sendAtCmd(data)
            result = waitAtResponse("SEND OK", "SEND FAIL", "ERROR", 5000)

            // // close the TCP connection
            // sendAtCmd("AT+CIPCLOSE")
            // waitAtResponse("OK", "ERROR", "None", 2000)

            if (result == 1) break
        }
    }

    /**
       * Send data to Thingsboard
       */
    //% subcategory="WiFi"
    //% block="Send Data to your Thingsboard Server|Token %AccessToken|Daten_1 %Daten1||Daten_2 %Daten2|Daten_3 %Daten3|Daten_4 %Daten4|Daten_5 %Daten5|Daten_6 %Daten6|Daten_7 %Daten7|Daten_8 %Daten8"
    //% group="UartWiFi"
    //% expandableArgumentMode="enabled"
    //% AccessToken.defl="API Token(Thingsboard)"
    //% weight=10
    export function sendToThingsboard(AccessToken: string, Daten1: number = 0.0, Daten2: number = 0.0, Daten3: number = 0.0, Daten4: number = 0.0, Daten5: number = 0.0, Daten6: number = 0.0, Daten7: number = 0.0, Daten8: number = 0.0) {
        let result = 0
        let retry = 2
        let Serveradresse = "paminasogo.ddns.net"
        let Port = "9090"
        let data: { [key: string]: number } = {
            "Daten1": Daten1,
            "Daten2": Daten2,
            "Daten3": Daten3,
            "Daten4": Daten4,
            "Daten5": Daten5,
            "Daten6": Daten6,
            "Daten7": Daten7,
            "Daten8": Daten8
        }

        /* let data = {}
         if (!isNaN(Daten1)) data = {
                     "Daten1": Daten1}
         if (!isNaN(Daten2)) data = {
                     "Daten1": Daten1,
                     "Daten2": Daten2}
         if (!isNaN(Daten3)) data = {
                     "Daten1": Daten1,
                     "Daten2": Daten2,
                     "Daten3": Daten3}
         if (!isNaN(Daten4)) data = {
                     "Daten1": Daten1,
                     "Daten2": Daten2,
                     "Daten3": Daten3,
                     "Daten4": Daten4}
         if (!isNaN(Daten5)) data = {
                     "Daten1": Daten1,
                     "Daten2": Daten2,
                     "Daten3": Daten3,
                     "Daten4": Daten4,
                     "Daten5": Daten5}
         if (!isNaN(Daten6)) data = {
                     "Daten1": Daten1,
                     "Daten2": Daten2,
                     "Daten3": Daten3,
                     "Daten4": Daten4,
                     "Daten5": Daten5,
                     "Daten6": Daten6}
         if (!isNaN(Daten7)) data = {
                     "Daten1": Daten1,
                     "Daten2": Daten2,
                     "Daten3": Daten3,
                     "Daten4": Daten4,
                     "Daten5": Daten5,
                     "Daten6": Daten6,
                     "Daten7": Daten7}
         if (!isNaN(Daten8)) data = {
                     "Daten1": Daten1,
                     "Daten2": Daten2,
                     "Daten3": Daten3,
                     "Daten4": Daten4,
                     "Daten5": Daten5,
                     "Daten6": Daten6,
                     "Daten7": Daten7,
                     "Daten8": Daten8
                     }*/

        // close the previous TCP connection
        if (isWifiConnected) {
            sendAtCmd("AT+CIPCLOSE")
            waitAtResponse("OK", "ERROR", "None", 200) //vorher 2000
        }

        const payload = JSON.stringify(data);
        const request = `POST /api/v1/${AccessToken}/telemetry HTTP/1.1\r\n` +
            `Host: ${Serveradresse}\r\n` +
            `Content-Type: application/json\r\n` +
            `Content-Length: ${payload.length}\r\n\r\n` +
            `${payload}`;

        while (isWifiConnected && retry > 0) {
            retry = retry - 1;

            sendAtCmd(`AT+CIPSTART="TCP","${Serveradresse}",${Port}\r\n`);
            result = waitAtResponse("OK", "ALREADY CONNECTED", "ERROR", 200) //vorher 2000
            if (result == 3) continue

            sendAtCmd(`AT+CIPSEND=${request.length}\r\n`);
            result = waitAtResponse(">", "OK", "ERROR", 200) //vorher 2000
            if (result == 3) continue

            sendAtCmd(request);
            result = waitAtResponse("SEND OK", "SEND FAIL", "ERROR", 200) //vorher 5000
            if (result == 1) break

            // close the previous TCP connection
            if (isWifiConnected) {
                sendAtCmd("AT+CIPCLOSE")
                waitAtResponse("OK", "ERROR", "None", 200) //vorher 2000
            }


        }
    }

    /**
     * Create a new driver of Grove - Ultrasonic Sensor to measure distances in cm
     * @param pin signal pin of ultrasonic ranger module
     * @param unit Distance unit of the measurement, cm or inch
     */
    //% blockId=grove_ultrasonic_centimeters
    //% block="Distance|%pin|%unit"
    //% block.loc.de="Entfernung|%pin|%unit"
    //% pin.fieldEditor="gridpicker" pin.fieldOptions.columns=4
    //% pin.fieldOptions.tooltips="false" pin.fieldOptions.width="250"
    //% group="Ultrasonic" group.loc.de="Ultraschall" pin.defl=DigitalPin.C16
    //% subcategory="Sensoren"
    export function measureDistance(pin: DigitalPin, unit: DistanceUnit): number {
        let duration = 0;
        let range = 0;
        const boardVersionDivider = ((control.ramSize() > 64000) ? 29 : 44); // CODAL = 29, DAL = 44
        const distanceUnitDivider = (unit == DistanceUnit.cm ? 1 : 2.54); // cm = 1, inch = 2.54

        pins.digitalWritePin(pin, 0);
        control.waitMicros(2);
        pins.digitalWritePin(pin, 1);
        control.waitMicros(20);
        pins.digitalWritePin(pin, 0);
        duration = pins.pulseIn(pin, PulseValue.High, 50000); // Max duration 50 ms
        range = Math.round(duration * 153 / boardVersionDivider / 2 / 100 / distanceUnitDivider); 
        if (range > 0) distanceBackup = range;
        else range = distanceBackup;
        basic.pause(50);
        return range;
    }
    
    /**
     * Read the temperature(°C) from Grove-AHT20(SKU#101990644)
     */
    //% subcategory="Sensoren"
    //% group="AHT20"
    //% block.loc.de="Temperature in °C"
    //% block="[Grove - Temp&Humi Sensor]|Read the temperature(°C))"
    //% weight=3
    export function aht20ReadTemperatureC(): number {
        const aht20 = new grove.sensors.AHT20();
        const val = Read(aht20);
        if (val == null) return null;

        return Math.round(val.Temperature * 1000) / 1000;   // vorher val.Temperature;

    }
    /**
     * Read the humidity from Grove-AHT20(SKU#101990644)
     */
    //% subcategory="Sensoren"
    //% group="AHT20"
    //% block.loc.de="Feuchtigkeit in Prozent"
    //% block="[Grove - Temp&Humi Sensor]|Read the humidity"
    //% weight=1
    export function aht20ReadHumidity(): number {
        const aht20 = new grove.sensors.AHT20();
        const val = Read(aht20);
        if (val == null) return null;

        return Math.round(val.Humidity * 1000) / 1000; //vorher return val.humidity

    }
    
    
    function Read(aht20: grove.sensors.AHT20): { Humidity: number, Temperature: number } {
        if (!aht20.GetState().Calibrated) {
            aht20.Initialization();
            if (!aht20.GetState().Calibrated) return null;
        }

        aht20.TriggerMeasurement();
        for (let i = 0; ; ++i) {
            if (!aht20.GetState().Busy) break;
            if (i >= 500) return null;
            basic.pause(10);
        }

        return aht20.Read();
    }


    function waitAtResponse(target1: string, target2: string, target3: string, timeout: number) {
        let buffer = ""
        let start = input.runningTime()

        while ((input.runningTime() - start) < timeout) {
            buffer += serial.readString()

            if (buffer.includes(target1)) return 1
            if (buffer.includes(target2)) return 2
            if (buffer.includes(target3)) return 3
            
            basic.pause(100)
        }
        
        return 0
    }
    
    function sendAtCmd(cmd: string) {
        serial.writeString(cmd + "\u000D\u000A")
    }
}