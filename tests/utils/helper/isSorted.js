// Check the array is sorted
// return:
//   if positive ->  1
//   if negative -> -1
//   not sorted  ->  0
export default function (array, predicate = (a) => a) {
    let direction;
    const result = array.reduce((prev, next, i, arr) => {
        if (direction === undefined) {
            return (
              direction = predicate(prev) <= predicate(next) ? 1 : -1
            ) || true;
        }

        return (
          direction + 1 ?
            (predicate(arr[i - 1]) <= predicate(next)) :
            (predicate(arr[i - 1]) > predicate(next))
        );
    })

    return result ? Number(direction) : 0;
}
