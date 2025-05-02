// pages/DashboardPage.js
import React, {useCallback, useState} from "react";
import {Avatar, Col, ConfigProvider, Form, Input, Layout, List, Row, Space, Statistic, Typography} from "antd";
import {debounce} from "lodash";
import supabase from "../supabase.js";
import VirtualList from 'rc-virtual-list';
import {SwipeAction} from "antd-mobile";
import {HeartFilled, HeartOutlined} from "@ant-design/icons";

function SearchPage() {
  const [data, setData] = useState([]);

  const debouncedUpdate = useCallback(
    debounce(async ({last_name, first_name, precinct_no, address}) => {
      // setFormData(values);
      const {data, error} = await supabase
        .from('dataflux827')
        .select('*')
        .ilike(`name`, `%${last_name || ''}%`)
        .ilike(`name`, `%${first_name || ''}%`)
        .ilike(`precinct`, `%${precinct_no || ''}%`)
        .ilike(`address`, `%${address || ''}%`)
        .limit(10)
      setData(data);

    }, 1000),
    []
  );

  const markAsDone = async (user) => {
    const {data, error} = await supabase.from('dataflux827')
      .update({status: 1, updated_at: new Date()})
      .eq('id', user.id)
      .select()

    setData(data)
  }

  const markAsUndone = async (user) => {
    const {data, error} = await supabase.from('dataflux827')
      .update({status: 0, updated_at: new Date()})
      .eq('id', user.id)
      .select()

    setData(data)
  }


  return (
    <Col style={{height: '100%', width: '100vw'}}>
      <Row size={5} direction="vertical" style={{padding: '10px 5px 10px 5px', width: '100%'}}>
        <Form
          name="searchForm"
          style={{width: '100%'}}
          size="large"
          onValuesChange={(_, allValues) => debouncedUpdate(allValues)}>
          <Space direction="vertical" style={{width: '100%'}}>
            <Form.Item name="last_name" noStyle>
              <Input size={"large"} placeholder="Last Name" allowClear/>
            </Form.Item>
            <Form.Item name="first_name" noStyle>
              <Input size={"large"} placeholder="First Name" allowClear/>
            </Form.Item>
            <Form.Item name="precinct_no" noStyle>
              <Input size={"large"} placeholder="Precinct No." allowClear/>
            </Form.Item>
            <Form.Item name="address" noStyle>
              <Input size={"large"} placeholder="Address" allowClear/>
            </Form.Item>
          </Space>
        </Form>
      </Row>
      <Row>
        <List style={{width: '100%', overflowY: 'auto'}}>
          <VirtualList
            data={data}
            height={600}
            itemKey="uuid"
            onScroll={() => {
            }}
          >
            {(user) => (
              <SwipeAction
                key={user.id}
                rightActions={[
                  {key: "done", text: "Done", color: "primary", onClick: () => markAsDone(user)},
                ]}
                leftActions={[
                  {key: "undo", text: "Undo", color: "light", onClick: () => markAsUndone(user)},
                ]}
                style={{
                  margin: '0 5px 0 5px'
                }}
              >
                <List.Item style={{margin: '0 10px 0 10px'}}>
                  <List.Item.Meta
                    avatar={<Avatar size={50} shape="square" style={{color: 'dimgray'}}><b>{user.precinct}</b></Avatar>}
                    title={user.name}
                    description={<Space>
                      <b>District {user.district}</b>
                      <Typography.Text>{user.address}</Typography.Text>
                    </Space>
                    }
                  />
                  {user.status === 1 && <HeartFilled style={{fontSize: '24px', color: '#24AC58'}}/>}
                </List.Item>
              </SwipeAction>
            )}
          </VirtualList>
        </List>
      </Row>
    </Col>

  );
}

export default SearchPage;
