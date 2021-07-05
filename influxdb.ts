import { InfluxDB, Point } from "@influxdata/influxdb-client";
import dotenv from 'dotenv';
dotenv.config();

export interface WriteMeterData {
    ts: Date,
    temperature: number,
    humidity: number
};

const client = new InfluxDB({ url: process.env.INFLUXDB_HOST || '', token: process.env.INFLUXDB_TOKEN || '' });
const writeApi = client.getWriteApi(process.env.INFLUXDB_ORG || '', process.env.INFLUXDB_BUCKET || '');
writeApi.useDefaultTags({ host: 'switchbot' });

export const writeMeterData = (data: WriteMeterData) => {
    const point = new Point('data');
    point.timestamp(data.ts);
    point.floatField('temperature', data.temperature);
    point.floatField('humidity', data.humidity);
    writeApi.writePoint(point);
};