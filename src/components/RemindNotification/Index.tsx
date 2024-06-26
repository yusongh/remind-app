import React, { useEffect, useState, useCallback } from 'react'
import { Button, Form, Input, Checkbox } from 'antd'
import type { FieldType as RestTimeFieldType } from '../RestTimeConfig/Index'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)

type FieldType = {
  timeInterval: number,
  tipsContent: string,
  isNeedPromptSound: boolean
}

interface PropsType {
  restTime: RestTimeFieldType
}

let intervalId = 0
let isLockScreenStopNotification = false // 锁屏后停止了通知
let currentFormData: FieldType = {
  timeInterval: 30,
  tipsContent: '时间到，活动下！',
  isNeedPromptSound: true
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
  const notification = new Notification(currentFormData.tipsContent, {
    body: `当前的时间为${nowTime}`,
    icon: '/logo.png',
    silent: !currentFormData.isNeedPromptSound
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

const RemindNotification: React.FC<PropsType> = (props) => {
  const [isCountdown, setIsCountdown] = useState(false)
  
  const stopNotification = useCallback(() => {
    stopInterval()
    setIsCountdown(false)
  }, [])

  const startNotification = (formData: FieldType) => {
    startInterval(formData)
    setIsCountdown(true)
  }

  useEffect(() => {
    const lockScreen = () => {
      // TODO: 该回调函数会被执行多次，后续需想办法解决！！
      console.log('----------', isCountdown)
      // 锁屏后马上停止通知
      if (isCountdown) {
        stopNotification()
        isLockScreenStopNotification = true
      }
    }

    const unlockScreen = () => {
      if (isLockScreenStopNotification) {
        startNotification(currentFormData)
      }
      isLockScreenStopNotification = false
    }

    // 监听系统锁屏
    window.electronAPI.onSystemLockScreen(lockScreen)
    // 监听系统解除锁屏
    window.electronAPI.onSystemUnlockScreen(unlockScreen)
  }, [isCountdown])

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
        <Form.Item
          label="时间间隔"
          name="timeInterval"
          rules={[{ required: true, message: '请输入时间间隔！' }]}
        >
          <Input disabled={isCountdown} />
        </Form.Item>
        <Form.Item
          label="提示内容"
          name="tipsContent"
          rules={[{ required: true, message: '请输入提示内容！' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="是否需要提示音"
          name="isNeedPromptSound"
          rules={[{ required: true, message: '请选择是否需要提示音！' }]}
          valuePropName="checked"
        >
          <Checkbox />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" loading={isCountdown}>
            开始提示
          </Button>
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" onClick={stopNotification} disabled={!isCountdown}>
            暂停提示
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}

export default RemindNotification
