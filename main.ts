import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { writeMeterData, WriteMeterData } from './influxdb';
dotenv.config();

interface DeviceList {
    deviceId: string;
    deviceName: string;
    deviceType: string;
    enableCloudService: boolean;
    hubDeviceId: string;
}

interface InfraredRemoteList {
    deviceId: string;
    deviceName: string;
    remoteType: string;
    hubDeviceId: string;
}

interface DeviceBody {
    deviceList: DeviceList[];
    infraredRemoteList: InfraredRemoteList[];
}

interface GetDevices {
    statusCode: number;
    body: DeviceBody;
    message: string;
}

interface MeterDataBody {
    deviceId: string;
    deviceType: string;
    hubDeviceId: string;
    humidity: number;
    temperature: number;
}

interface MeterData {
    statusCode: number;
    body: MeterDataBody;
    message: string;
}


const getSwitchBotDevices = async () => {
    return fetch('https://api.switch-bot.com/v1.0/devices', {
        headers: {
            'Authorization': process.env.SWITCHBOT_OPENTOKEN || ''
        }
    }).then(res => res.json());
};
const getMeterData = async (id: string) => {
    return fetch(`https://api.switch-bot.com/v1.0/devices/${id}/status`, {
        headers: {
            'Authorization': process.env.SWITCHBOT_OPENTOKEN || ''
        }
    }).then(res => res.json());
}
(async () => {
    const devices: GetDevices = await getSwitchBotDevices();
    const meterDeviceID = devices.body.deviceList.find(d => d.deviceType === 'Meter')?.deviceId || '';

    const meterData: MeterData = await getMeterData(meterDeviceID);
    const ts = new Date();
    const data: WriteMeterData = {
        ts: ts,
        temperature: meterData.body.temperature,
        humidity: meterData.body.humidity
    };
    console.log(data);
    writeMeterData(data);
})();