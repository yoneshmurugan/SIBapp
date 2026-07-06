import { FilePlus } from 'lucide-react'
import Helpful from './Helpful'

function getPrimitive(val) {
  if (
    val &&
    typeof val === 'object' &&
    '$numberDecimal' in val
  ) {
    return Number(val.$numberDecimal)
  }
  return val
}

function ActivityP({
  content = 'Activity',
  upcoming = null,
  actual = 102,
}) {
  return (
    <div className="activityP flex flex-row justify-between items-center m-3 px-2 lg:py-0.5">
      <p className="text-gray-600 dark:text-gray-300 text-md font-semibold">{content}</p>
      <div className="nums flex flex-row gap-4 items-center">
        <Helpful
          content={upcoming !== 0 ? `+${upcoming}` : ''}
          content2="Values Yet to be added"
          styles="num font-bold text-yellow-400 dark:text-yellow-300"
        />
        <Helpful
          content={getPrimitive(actual)}
          content2={"Values approved by admin"}
          styles="actual font-bold text-gray-600 dark:text-gray-300"
        />
        <FilePlus
          className="icon mt-1"
          style={{ color: 'currentColor', height: '1.2rem', width: '1.2rem' }}
        />
      </div>
    </div>
  )
}

export default ActivityP
