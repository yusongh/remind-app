import React, { useState } from 'react'
import { Divider, Form, TimePicker, Switch } from 'antd'
import style from './rest-time-config.module.scss'
import dayjs from 'dayjs'

export interface FieldType {
  startTime: string
  endTime: string
}

type PropsTypes = {
  onRestTimeChange?: (value: FieldType) => void
}

const RestTimeConfig: React.FC<PropsTypes> = (props) => {
  const [ isOpen, setIsOpen ] = useState(false)
  const [ formData, setFormData ] = useState<FieldType>({
    startTime: '',
    endTime: ''
  })

  const isOpenChange = (isOpen: boolean) => {
    setIsOpen(isOpen)
    // TODO: 重新开启是否需要同步时间？
    if (isOpen) {
      props.onRestTimeChange?.(formData)
    }
  }

  const format = 'HH:mm:ss'

  const restTimeChange = (_: Partial<FieldType>, data: FieldType) => {
    const formatData = {
      startTime: data.startTime ? dayjs(data.startTime).format(format) : '',
      endTime: data.endTime ? dayjs(data.endTime).format(format) : ''
    }
    setFormData(formatData)
    props.onRestTimeChange?.(formatData)
  }

  return (
    <>
      <Divider />
      <h3>
        <span className={style.title}>休息时间配置</span>
        <Switch checked={isOpen} onChange={isOpenChange}></Switch>
      </h3>

      <Form
        name="restTimeConfig"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        disabled={!isOpen}
        onValuesChange={restTimeChange}
      >
        <Form.Item
          name="startTime"
          label="开始时间"
        >
          <TimePicker format={format}></TimePicker>
        </Form.Item>
        <Form.Item
          name="endTime"
          label="结束时间"
        >
          <TimePicker format={format}></TimePicker>
        </Form.Item>
      </Form>

      <Divider />
    </>
  )
}

export default RestTimeConfig
