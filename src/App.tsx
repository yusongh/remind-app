import React, { useEffect, useState, useCallback } from 'react';
import { Button, Form, Input } from 'antd';

type FieldType = {
  timeInterval: number
}

let intervalId = 0
let lockScreenTimeoutId = 0

const showNotification = () => {
  const notification = new Notification('时间到，活动下！')
  notification.onshow = () => {
    console.log('当前时间为：' + new Date())
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
    }, 2 * 60 * 60 * 1000)
  }, [])

  useEffect(() => {
    // 监听系统锁屏
    window.electronAPI.onSystemLockScreen(lockScreen)
    // 监听系统解除锁屏
    window.electronAPI.onSystemUnlockScreen(() => {
      lockScreenTimeoutId && clearTimeout(lockScreenTimeoutId)
    })

    return () => {
      stopNotification()
    }
  }, [stopNotification])

  const onFinish = (formData: FieldType) => {
    startInterval(formData)
    setIsCountdown(true)
  }

  return (
    <>
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ timeInterval: 30 }}
        onFinish={onFinish}
        autoComplete="off"
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
