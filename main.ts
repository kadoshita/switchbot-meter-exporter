import csvParse from 'csv-parse/lib/sync';
import fs from 'fs/promises';

interface CsvData {
    Timestamp: string,
    Temperature_Celsius: string,
    Relative_Humidity: string
};
interface MeterData {
    ts: string,
    temperature: number,
    humidity: number
}

(async () => {
    const data = await (await fs.readFile('data.csv')).toString();
    const csv: CsvData[] = csvParse(data, { columns: true });
    const parsedData = csv.map(d => {
        const ts = new Date(d.Timestamp);
        const data: MeterData = {
            ts: ts.toISOString(),
            temperature: parseFloat(d.Temperature_Celsius),
            humidity: parseFloat(d.Relative_Humidity)
        }
        return data;
    });
    console.log(parsedData);
})();