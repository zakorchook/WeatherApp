import adb from 'adbkit';

const client = adb.createClient();

export default async function swipe({x1, y1, x2, y2}) {
    return await client.shell(
        this.config.deviceName,
        `input touchscreen swipe ${x1} ${y1} ${x2} ${y2} 2000`
    )
}
