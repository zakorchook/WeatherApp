import { range } from 'lodash'

/**
 * This helper iterates over visible items
 * @param  {Array}   array     Array of visible items
 * @param  {Function} callback Callback that applies for each item
 * @return {Array}             new Array
 */
export default async function mapOverVisible(array, callback) {
    /* eslint no-unused-vars: 0 */
    let i = 1
    const nextArray = []
    for (const x of range(1, array.length + 1)) {
        const item = array[x - 1]

        // Starts from 0
        const arrayIndex = x - 1

        // Starts from 1 in Android
        const elementIndex = x

        // Store transformed item
        const y = await callback(item, arrayIndex, elementIndex, array)

        // Add into result array
        nextArray.push(y)
        i += 1
    }

    return nextArray
}
