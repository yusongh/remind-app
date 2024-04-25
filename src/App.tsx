import RestTimeConfig, { FieldType as RestTimeFieldType } from './components/RestTimeConfig/Index'
import RemindNotification from './components/RemindNotification/Index'
import { useState } from 'react'

const App: React.FC = () => {
  // 休息时间
  const [restTime, setRestTime] = useState<RestTimeFieldType>({
    startTime: '',
    endTime: ''
  })

  /**
   * 休息时间改变了
   */
  const onRestTimeChange = (data: RestTimeFieldType) => {
    setRestTime(data)
  }

  return (
    <>
      {/* 提示通知 */}
      <RemindNotification restTime={restTime}></RemindNotification>

      {/* 休息时间配置 */}
      <RestTimeConfig onRestTimeChange={onRestTimeChange}/>
    </>
  )
}

export default App
