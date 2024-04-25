import React, { useEffect, useState, useCallback } from 'react'
import { Button, Form, Input } from 'antd'
import type { FieldType as RestTimeFieldType } from '../RestTimeConfig/Index'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)

type FieldType = {
  timeInterval: number
}

interface PropsType {
  restTime: RestTimeFieldType
}

let restTime: RestTimeFieldType = {
  startTime: '',
  endTime: ''
}

/**
 * 判断当前是否处于休息时间
 */
const isOnRestTime = () => {
  const { startTime, endTime } = restTime
  if (!startTime || !endTime) return false

  // 需要拼接上年月日，不然 isBetween 判断有问题
  const currentYmd = dayjs().format('YYYY-MM-DD')

  if (dayjs().isBetween(`${currentYmd} ${startTime}`, `${currentYmd} ${endTime}`)) {
    return true
  }

  return false
}

/**
 * 提示通知
 */
const showNotification = () => {
  // 判断是否处于休息时间
  if (isOnRestTime()) return false

  const nowTime = new Date()
  const notification = new Notification('时间到，活动下！', {
    body: `当前的时间为${nowTime}`
  })
  notification.onshow = () => {
    console.log('当前时间为：' + nowTime)
  }
}

/**
 * 停止轮询
 */
const stopInterval = () => {
  clearInterval(intervalId)
}

/**
 * 开始轮询
 */
const startInterval = ({timeInterval}: FieldType) => {
  stopInterval()
  intervalId = window.setInterval(() => {
    showNotification()
  }, timeInterval * 60 * 1000)
}

let intervalId = 0
let lockScreenTimeoutId = 0
let isLockScreenStopNotification = false // 锁屏后停止了通知
let currentFormData: FieldType = { timeInterval: 30 }

const RemindNotification: React.FC<PropsType> = (props) => {
  const [isCountdown, setIsCountdown] = useState(false)
  
  const stopNotification = useCallback(() => {
    stopInterval()
    setIsCountdown(false)
  }, [])

  // 锁屏超过两小时则停止通知
  const lockScreen = useCallback(() => {
    lockScreenTimeoutId = window.setTimeout(() => {
      console.log('锁屏->停止通知')
      stopNotification()
      isLockScreenStopNotification = true
    }, 2 * 60 * 60 * 1000)
  }, [])

  const startNotification = (formData: FieldType) => {
    startInterval(formData)
    setIsCountdown(true)
  }

  useEffect(() => {
    // 监听系统锁屏
    window.electronAPI.onSystemLockScreen(lockScreen)
    // 监听系统解除锁屏
    window.electronAPI.onSystemUnlockScreen(() => {
      lockScreenTimeoutId && clearTimeout(lockScreenTimeoutId)
      if (isLockScreenStopNotification) {
        startNotification(currentFormData)
      }
      isLockScreenStopNotification = false
    })

    return () => {
      stopNotification()
    }
  }, [stopNotification])

  useEffect(() => {
    restTime = props.restTime
  }, [props.restTime])

  return (
    <>
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={currentFormData}
        onFinish={startNotification}
        autoComplete="off"
        onValuesChange={(_, allValue) => currentFormData = allValue}
      >
        <Form.Item<FieldType>
          label="时间间隔"
          name="timeInterval"
          rules={[{ required: true, message: '请输入时间间隔！' }]}
        >
          <Input disabled={isCountdown} />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" loading={isCountdown}>
            开始提示
          </Button>
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" onClick={stopNotification}>
            暂停提示
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}

export default RemindNotification
