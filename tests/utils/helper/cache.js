import axios from 'axios'

const cache = {}

async function getStores() {
    const { stores } = cache
    if (stores) {
        return stores
    }
    const { data } = await axios.get('https://test.gettipsi.com/retail/store')
    cache.stores = data
    return data
}

export default {
    getStores,
}
