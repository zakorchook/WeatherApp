export default async function (func) {
    try {
        return await func()
    } catch (error) {
        return null
    }
}
