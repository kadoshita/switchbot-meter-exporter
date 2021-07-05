import csvParse from 'csv-parse/lib/sync';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import { WriteMeterData, writeMeterData } from './influxdb';

dotenv.config();

interface CsvData {
    Timestamp: string,
    Temperature_Celsius: string,
    Relative_Humidity: string
};

(async () => {
    const data = await (await fs.readFile('data.csv')).toString();
    const csv: CsvData[] = csvParse(data, { columns: true });
    const parsedData = csv.map(d => {
        const ts = new Date(d.Timestamp);
        const data: WriteMeterData = {
            ts: ts,
            temperature: parseFloat(d.Temperature_Celsius),
            humidity: parseFloat(d.Relative_Humidity)
        }
        return data;
    });

    parsedData.forEach(d => {
        writeMeterData(d);
    });
})();