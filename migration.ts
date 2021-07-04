import csvParse from 'csv-parse/lib/sync';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import { InfluxDB, Point } from '@influxdata/influxdb-client';

dotenv.config();

interface CsvData {
    Timestamp: string,
    Temperature_Celsius: string,
    Relative_Humidity: string
};
interface MeterData {
    ts: Date,
    temperature: number,
    humidity: number
};

(async () => {
    const client = new InfluxDB({ url: process.env.INFLUXDB_HOST || '', token: process.env.INFLUXDB_TOKEN || '' });
    const writeApi = client.getWriteApi(process.env.INFLUXDB_ORG || '', process.env.INFLUXDB_BUCKET || '');
    writeApi.useDefaultTags({ host: 'switchbot' });


    const data = await (await fs.readFile('data.csv')).toString();
    const csv: CsvData[] = csvParse(data, { columns: true });
    const parsedData = csv.map(d => {
        const ts = new Date(d.Timestamp);
        const data: MeterData = {
            ts: ts,
            temperature: parseFloat(d.Temperature_Celsius),
            humidity: parseFloat(d.Relative_Humidity)
        }
        return data;
    });

    parsedData.forEach(async d => {
        const point = new Point('data');
        point.timestamp(d.ts);
        point.floatField('temperature', d.temperature);
        point.floatField('humidity', d.humidity);
        writeApi.writePoint(point);
    });
})();