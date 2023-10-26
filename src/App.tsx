import React, { useEffect, useState, useCallback } from 'react';
import { Button, Form, Input } from 'antd';

type FieldType = {
  timeInterval: number
}

let intervalId = 0
let lockScreenTimeoutId = 0
let isLockScreenStopNotification = false // 锁屏后停止了通知
let currentFormData: FieldType = { timeInterval: 30 }

const showNotification = () => {
  const nowTime = new Date()
  const notification = new Notification('时间到，活动下！', {
    body: `当前的时间为${nowTime}`
  })
  notification.onshow = () => {
    console.log('当前时间为：' + nowTime)
  }
}

const stopInterval = () => {
  clearInterval(intervalId)
}

const startInterval = ({timeInterval}: FieldType) => {
  stopInterval()
  intervalId = window.setInterval(() => {
    showNotification()
  }, timeInterval * 60 * 1000)
}

const App: React.FC = () => {
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
          <Input />
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

export default App
